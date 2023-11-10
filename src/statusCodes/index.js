exports.statusCode200 = (res, message = { message: 'Success' }) => {
  res.code(200).send(message)
}

exports.statusCode201 = (res, message = { message: 'Created' }) => {
  res.code(201).send(message)
}

exports.statusCode401 = (res, message = { message: 'Not authorized' }) => {
  res.code(401).send(message)
}

exports.statusCode403 = (res, message = { message: 'Forbidden' }) => {
  res.code(403).send(message)
}

exports.statusCode404 = (res, message = { message: 'Bad request' }) => {
  res.code(404).send(message)
}

