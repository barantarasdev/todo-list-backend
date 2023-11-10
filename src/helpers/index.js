const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES, NEW_ORDER_STEP } = require('../constants')

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES })
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRES })
}

function getNewOrder(start, finish, key) {
  let newOrder

  if (start === null && finish !== null) {
    newOrder = +finish[key] - NEW_ORDER_STEP
  } else if (start !== null && finish === null) {
    newOrder = +start[key] + NEW_ORDER_STEP
  } else if (start === null && finish === null) {
    newOrder = NEW_ORDER_STEP
  } else {
    newOrder = (+start[key] + +finish[key]) / 2
  }

  return newOrder
}

function getTime() {
  const timestamp = new Date().getTime()
  const timestampString = timestamp.toString()

  return timestampString.slice(-4)
}

module.exports = {
  getTime,
  getNewOrder,
  generateAccessToken,
  generateRefreshToken
}