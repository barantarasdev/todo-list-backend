const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { statusCode201, statusCode401, statusCode200, statusCode403 } = require('../statusCodes')
const { SALT_ROUNDS } = require('../constants')
const { generateAccessToken, generateRefreshToken } = require('../helpers')
const db = require('../database')

exports.handleRefresh = (request, reply) => {
  const currentRefreshToken = request.body?.refresh_token

  if (!currentRefreshToken) {
    return statusCode401(reply)
  }

  jwt.verify(currentRefreshToken, process.env.REFRESH_SECRET_KEY, async (err, user) => {
    if (err) {
      return statusCode403(reply)
    }

    const verifiedToken = await db.verifyRefreshToken(request)

    if (!verifiedToken) {
      return statusCode403(reply)
    }

    const newUser = { user_name: user.user_name, user_id: request.body.user_id }
    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    await db.deleteRefreshToken(request)
    await db.createRefreshToken(refreshToken, newUser.user_id)

    return statusCode200(reply, { accessToken, refreshToken })
  })
}

exports.handleRegister = async (request, reply) => {
  const user = await db.getUser(request)

  if (user) {
    return statusCode403(reply)
  }

  const hashedPassword = await bcrypt.hash(request.body.user_password, SALT_ROUNDS)
  const newUser = { ...request.body, user_password: hashedPassword }
  const accessToken = generateAccessToken(newUser)
  const refreshToken = generateRefreshToken(newUser)
  const user_id = await db.createUser(newUser)

  await db.createRefreshToken(refreshToken, user_id)

  return statusCode201(reply, { accessToken, refreshToken, user_id })
}

exports.handleLogin = async (request, reply) => {
  const user = await db.getUser(request)

  if (!user) {
    return statusCode401(reply)
  }

  const isMatch = await bcrypt.compare(request.body.user_password, user.user_password)

  if (!isMatch) {
    return statusCode401(reply)
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  const { user_name, user_id } = user

  await db.createRefreshToken(refreshToken, user_id)

  return statusCode200(reply, {
    accessToken,
    refreshToken,
    user_name,
    user_id
  })
}

exports.handleLogout = async (request, reply) => {
  await db.deleteRefreshToken(request)

  return statusCode200(reply)
}