const { PrismaClient } = require('@prisma/client')
const { convertKeysToCamelCase } = require('../helpers')

class DataBase {
  constructor() {
    this.db = new PrismaClient()
    this.todos = this.db.todos
    this.users = this.db.users
    this.refresh_tokens = this.db.refresh_tokens
  }

  getUser = async (request) => {
    const user = await this.users.findUnique({
      where: {
        user_email: request.body.userEmail
      }
    })

    return user
  }

  createUser = async (data) => {
    const {
      userName: user_name,
      userEmail: user_email,
      userPassword: user_password,
      userPhone: user_phone,
      userAge: user_age,
      userGender: user_gender,
      userSite: user_site
    } = data
    const user = await this.users.create({
      data: {
        user_name,
        user_email,
        user_password,
        user_phone,
        user_age,
        user_gender,
        user_site
      }
    })

    return user.user_id
  }

  getTodos = async (request) => {
    const todos = await this.todos.findMany({
      where: {
        user_id: request.params.id
      },
      orderBy: {
        createdat: 'asc'
      }
    })

    return todos.map(todo => convertKeysToCamelCase(todo))
  }

  createTodo = async (request) => {
    const { todoCompleted: todo_completed, todoValue: todo_value, userId: user_id } = request.body
    const todo = await this.todos.create({
      data: {
        todo_completed,
        todo_value,
        user_id
      }
    })

    return todo.todo_id
  }

  updateTodo = async (request) => {
    const { todoValue: todo_value, todoCompleted: todo_completed } = request.body

    await this.todos.update({
      where: {
        todo_id: request.params.id
      },
      data: {
        todo_value,
        todo_completed
      }
    })
  }

  deleteTodo = async (request) => {
    await this.todos.delete({
      where: {
        todo_id: request.params.id
      }
    })
  }

  deleteRefreshToken = async (request) => {
    await this.refresh_tokens.delete({
      where: {
        refresh_token: request.body.refreshToken
      }
    })
  }

  createRefreshToken = async (refresh_token, user_id) => {
    await this.refresh_tokens.create({
      data: {
        user_id,
        refresh_token
      }
    })
  }

  verifyRefreshToken = async (request) => {
    const token = await this.refresh_tokens.findUnique({
      where: {
        refresh_token: request.body.refreshToken
      }
    })

    return !!token
  }
}

module.exports = new DataBase()