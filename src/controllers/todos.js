const db = require('../database')
const { statusCode200, statusCode201 } = require('../statusCodes')

exports.handleCreateTodo = async (request, reply) => {
  const todoId = await db.createTodo(request)

  return statusCode201(reply, { todoId })
}

exports.handleUpdateTodo = async (request, reply) => {
  await db.updateTodo(request)

  return statusCode200(reply)
}

exports.handleUpdateTodoOrder = async (request, reply) => {
  await db.updateTodoOrder(request)

  return statusCode200(reply)
}

exports.handleDeleteTodo = async (request, reply) => {
  await db.deleteTodo(request)

  return statusCode200(reply)
}