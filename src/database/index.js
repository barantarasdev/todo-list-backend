const { PrismaClient } = require('@prisma/client')
const { getNewOrder, getTime } = require('../helpers')

class DataBase {
  constructor() {
    this.db = new PrismaClient()
    this.todos = this.db.todos
    this.users = this.db.users
    this.refresh_tokens = this.db.refresh_tokens
    this.todos_cols = this.db.todo_cols
    this.cols = this.db.cols
  }

  getUser = async (request) => {
    const user = await this.users.findUnique({
      where: {
        user_email: request.body.userEmail,
      },
    })

    return user
  }

  getMaxOrder = async (entityType, userId) => {
    const result = await this[entityType].aggregate({
      where: {
        user_id: userId,
      },
      _max: {
        [`${entityType.slice(0, -1)}_order`]: true,
      },
    })

    return Number(result._max[`${entityType}_order`] + 1.0 || 1.0)
  }

  createUser = async (data) => {
    const {
      userName: user_name,
      userEmail: user_email,
      userPassword: user_password,
      userPhone: user_phone,
      userAge: user_age,
      userGender: user_gender,
      userSite: user_site,
    } = data
    const user = await this.users.create({
      data: {
        user_name,
        user_email,
        user_password,
        user_phone,
        user_age,
        user_gender,
        user_site,
      },
    })

    return user.user_id
  }

  getCols = async (request) => {
    const res = await this.cols.findMany({
      where: {
        user_id: request.params.id,
      },
      orderBy: {
        col_order: 'asc',
      },
      include: {
        todo_cols: {
          include: {
            todos: {
              select: {
                todo_id: true,
                todo_value: true,
                todo_completed: true,
                todo_order: true,
              },
            },
          },
        },
      },
    })

    return res.map(({ col_id, col_name, col_order, todo_cols }) => {
      return {
        columnId: col_id,
        columnName: col_name,
        columnOrder: col_order,
        todos: todo_cols
          .flatMap((todo_col) => todo_col.todos)
          .map((todo) => ({
            todoId: todo.todo_id,
            todoValue: todo.todo_value,
            todoCompleted: todo.todo_completed,
            todoOrder: todo.todo_order,
          }))
          .sort((prev, next) => prev.todoOrder - next.todoOrder),
      }
    })
  }

  createTodo = async (request) => {
    const {
      todo: {
        todoCompleted: todo_completed,
        todoValue: todo_value,
        userId: user_id,
      },
      columnId: col_id,
    } = request.body

    const time = getTime()
    const max = await this.getMaxOrder('todos', user_id)

    const res = String(max) + time
    const newOrder = Number(res)

    const { todo_id } = await this.todos.create({
      data: {
        todo_completed,
        todo_value,
        todo_order: newOrder,
        user_id,
      },
    })

    await this.todos_cols.create({
      data: {
        todo_id,
        col_id,
      },
    })

    return todo_id
  }

  createCol = async (request) => {
    const { columnName: col_name, userId: user_id } = request.body

    const max = await this.getMaxOrder('cols', user_id)
    const time = getTime()
    const res = String(max) + time

    const newOrder = Number(res)

    const { col_id } = await this.cols.create({
      data: {
        col_name,
        col_order: newOrder,
        user_id,
      },
    })

    return col_id
  }

  updateCol = async (request) => {
    const body = request.body
    const { id } = request.params

    let start = null
    let finish = null

    if (body.sourceColumn) {
      start = await this.cols.findUnique({
        where: {
          col_id: body.sourceColumn.columnId,
        },
      })
    }

    if (body.destinationColumn) {
      finish = await this.cols.findUnique({
        where: {
          col_id: body.destinationColumn.columnId,
        },
      })
    }

    const newOrder = getNewOrder(start, finish, 'col_order')

    await this.cols.update({
      where: { col_id: id },
      data: { col_order: newOrder },
    })
  }

  updateTodo = async (request) => {
    const { todoValue: todo_value, todoCompleted: todo_completed } =
      request.body

    await this.todos.update({
      where: {
        todo_id: request.params.id,
      },
      data: {
        todo_value,
        todo_completed,
      },
    })
  }

  updateTodoOrder = async (request) => {
    const body = request.body
    const { id } = request.params

    let start = null
    let finish = null

    if (body.sourceTodo) {
      start = await this.todos.findUnique({
        where: {
          todo_id: body.sourceTodo.todoId,
        },
      })
    }

    if (body.destinationTodo) {
      finish = await this.todos.findUnique({
        where: {
          todo_id: body.destinationTodo.todoId,
        },
      })
    }

    const newOrder = getNewOrder(start, finish, 'todo_order')

    await this.todos.update({
      where: { todo_id: id },
      data: { todo_order: newOrder },
    })

    await this.todos_cols.updateMany({
      where: { todo_id: id },
      data: { col_id: body.columnId },
    })
  }

  deleteTodo = async (request) => {
    const todoId = request.params.id

    await this.todos_cols.deleteMany({
      where: {
        todo_id: todoId,
      },
    })

    await this.todos.delete({
      where: {
        todo_id: todoId,
      },
    })
  }

  deleteRefreshToken = async (request) => {
    await this.refresh_tokens.delete({
      where: {
        refresh_token: request.body.refreshToken,
      },
    })
  }

  createRefreshToken = async (refresh_token, user_id) => {
    await this.refresh_tokens.create({
      data: {
        user_id,
        refresh_token,
      },
    })
  }

  verifyRefreshToken = async (request) => {
    const token = await this.refresh_tokens.findUnique({
      where: {
        refresh_token: request.body.refreshToken,
      },
    })

    return !!token
  }
}

module.exports = new DataBase()
