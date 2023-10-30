exports.statusCode200 = (res, message = { message: 'Success' }) => {
  res.statusCode = 200
  return res.end(JSON.stringify(message))
}

exports.statusCode201 = (res, message = { message: 'Created' }) => {
  res.statusCode = 201
  return res.end(JSON.stringify(message))
}

exports.statusCode401 = (res, message = { message: 'Not authorized' }) => {
  res.statusCode = 401
  return res.end(JSON.stringify(message))
}

exports.statusCode403 = (res, message = { message: 'Forbidden' }) => {
  res.statusCode = 403
  return res.end(JSON.stringify(message))
}

exports.statusCode404 = (res, message = { message: 'Not found' }) => {
  res.statusCode = 404
  return res.end(JSON.stringify(message))
}