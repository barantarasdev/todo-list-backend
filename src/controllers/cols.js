const db = require('../database')
const { statusCode200, statusCode201 } = require('../statusCodes')

exports.handleGetCols = async (request, reply) => {
  const cols = await db.getCols(request)

  return statusCode200(reply, { cols })
}

exports.handleCreateCol = async (request, reply) => {
  const colId = await db.createCol(request)

  return statusCode201(reply, { colId })
}

exports.handleUpdateCol = async (request, reply) => {
  await db.updateCol(request)

  return statusCode200(reply)
}
