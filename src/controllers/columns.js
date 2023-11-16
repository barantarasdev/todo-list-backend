const db = require('../database')
const { statusCode200, statusCode201 } = require('../statusCodes')

exports.handleGetColumns = async (request, reply) => {
  const columns = await db.getColumns(request)

  return statusCode200(reply, { columns })
}

exports.handleGetBoards = async (request, reply) => {
  const boards = await db.getBoards(request)

  return statusCode200(reply, { boards })
}

exports.handleCreateBoards = async (request, reply) => {
  const boardId = await db.createBoard(request)

  return statusCode200(reply, { boardId })
}

exports.handleCreateColumn = async (request, reply) => {
  const columnId = await db.createColumn(request)

  return statusCode201(reply, { columnId })
}

exports.handleUpdateColumn = async (request, reply) => {
  await db.updateColumnOrder(request)

  return statusCode200(reply)
}
