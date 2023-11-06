const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } = require('../constants')

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES })
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRES })
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

function convertKeysToCamelCase(obj) {
  const newObj = {}

  for (const key of Object.keys(obj)) {
    newObj[toCamelCase(key)] = obj[key]
  }
  return newObj
}


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  convertKeysToCamelCase
}