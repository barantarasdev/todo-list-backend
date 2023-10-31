const jwt = require('jsonwebtoken')
const { statusCode401, statusCode403 } = require('../statusCodes')
const { ACCESS_TOKEN_EXPIRES } = require('../constants')

function getId(req) {
  return req.url.split('/').pop()
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']
  const token = bearerHeader && bearerHeader.split(' ')[1]

  if (!token) {
    return statusCode401(res)
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err) => {
    if (err) {
      return statusCode403(res)
    }

    next()
  })
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES })
}

module.exports = {
  getId,
  verifyToken,
  generateAccessToken
}