const { PrismaClient } = require('@prisma/client')
const { getNewOrder, getTime } = require('../helpers')

class DataBase {
  constructor() {
    this.db = new PrismaClient()
    this.todos = this.db.todos
    this.users = this.db.users
    this.refresh_tokens = this.db.refresh_tokens
    this.columns = this.db.columns
    this.friendship = this.db.friendship
    this.boards = this.db.boards
  }

  getUser = async (userEmail) => {
    return await this.users.findUnique({
      where: {
        user_email: userEmail,
      },
    })
  }

  getMaxOrder = async (entityType, board_id) => {
    const result = await this[entityType].aggregate({
      where: {
        board_id: board_id,
      },
      _max: {
        [`${entityType.slice(0, -1)}_order`]: true,
      },
    })

    return Number(result._max[`${entityType}_order`] + 1.0 || 1.0)
  }

  createUser = async (data) => {
    const user = await this.users.create({
      data: {
        user_name: data.userName,
        user_email: data.userEmail,
        user_password: data.userPassword,
        user_phone: data.userPhone,
        user_age: data.userAge,
        user_gender: data.userGender,
        user_site: data.userSite,
      },
    })

    return user.user_id
  }

  getBoards = async (request) => {
    const { id } = request.params

    const friendBoards = await this.friendship.findMany({
      where: {
        friend_id: id,
      },
      select: {
        board_id: true,
      },
    })

    const boardIds = friendBoards.map((f) => f.board_id)

    const boards = await this.boards.findMany({
      where: {
        OR: [{ user_id: id }, { board_id: { in: boardIds } }],
      },
    })

    return boards.map(({ board_name, board_id, user_id }) => ({
      boardName: board_name,
      boardId: board_id,
      userId: user_id,
    }))
  }

  createBoard = async (request) => {
    const { boardName: board_name } = request.body
    const { id: user_id } = request.params

    const { board_id } = await this.boards.create({
      data: {
        board_name,
        user_id,
      },
    })

    return board_id
  }

  getColumns = async (request) => {
    const { id } = request.params

    const columns = await this.columns.findMany({
      where: {
        board_id: id,
      },
      orderBy: {
        column_order: 'asc',
      },
    })

    const todos = await this.todos.findMany({
      where: {
        board_id: id,
      },
      orderBy: {
        todo_order: 'asc',
      },
    })

    return columns.map(({ column_id, column_name, board_id }) => {
      const columnTodos = todos
        .filter((todo) => todo.column_id === column_id)
        .map(({ todo_id, todo_value, todo_completed }) => ({
          todoId: todo_id,
          todoValue: todo_value,
          todoCompleted: todo_completed,
        }))

      return {
        columnId: column_id,
        columnName: column_name,
        todos: columnTodos,
        boardId: board_id,
      }
    })
  }

  createColumn = async (request) => {
    const { columnName: column_name, boardId: board_id } = request.body

    const max = await this.getMaxOrder('columns', board_id)
    const time = getTime()
    const res = String(max) + time

    const newOrder = Number(res)

    const { column_id } = await this.columns.create({
      data: {
        column_name,
        column_order: newOrder,
        board_id,
      },
    })

    return column_id
  }

  updateColumnOrder = async (request) => {
    const body = request.body
    const { id } = request.params

    let start = null
    let finish = null

    if (body.sourceColumn) {
      start = await this.columns.findUnique({
        where: {
          column_id: body.sourceColumn.columnId,
        },
      })
    }

    if (body.destinationColumn) {
      finish = await this.columns.findUnique({
        where: {
          column_id: body.destinationColumn.columnId,
        },
      })
    }

    const newOrder = getNewOrder(start, finish, 'column_order')

    await this.columns.update({
      where: { column_id: id },
      data: { column_order: newOrder },
    })
  }

  createTodo = async (request) => {
    const {
      todo: {
        todoCompleted: todo_completed,
        todoValue: todo_value,
        boardId: board_id,
        columnId: column_id,
      },
    } = request.body

    const time = getTime()
    const max = await this.getMaxOrder('todos', board_id)

    const res = String(max) + time
    const newOrder = Number(res)

    const { todo_id } = await this.todos.create({
      data: {
        column_id,
        todo_completed,
        todo_value,
        todo_order: newOrder,
        board_id,
      },
    })

    return todo_id
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

  deleteTodo = async (request) => {
    await this.todos.delete({
      where: {
        todo_id: request.params.id,
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
      data: { todo_order: newOrder, column_id: body.columnId },
    })
  }

  inviteFriend = async (request) => {
    const { friendEmail, userId, boardId } = request.body

    const user = await this.getUser(friendEmail)

    if (!user) {
      return
    }

    await this.friendship.create({
      data: {
        friend_id: user.user_id,
        user_id: userId,
        board_id: boardId,
      },
    })
  }

  deleteRefreshToken = async (request) => {
    try {
      await this.refresh_tokens.delete({
        where: {
          refresh_token: request.body.refreshToken,
        },
      })
    } catch (error) {
      console.error(error)
    }
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
