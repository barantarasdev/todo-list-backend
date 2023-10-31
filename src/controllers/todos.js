const db = require('../database')
const { statusCode200, statusCode201 } = require('../statusCodes')

exports.handleGetTodos = async (request, reply) => {
  const todos = await db.getTodos(request)

  return statusCode200(reply, { todos })
}

exports.handleCreateTodo = async (request, reply) => {
  const todo_id = await db.createTodo(request)

  return statusCode201(reply, { todo_id })
}

exports.handleUpdateTodo = async (request, reply) => {
  await db.updateTodo(request)

  return statusCode200(reply)
}

exports.handleDeleteTodo = async (request, reply) => {
  await db.deleteTodo(request)

  return statusCode200(reply)
}