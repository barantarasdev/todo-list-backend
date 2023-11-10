const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { statusCode201, statusCode401, statusCode200, statusCode403, statusCode404 } = require('../statusCodes')
const { SALT_ROUNDS } = require('../constants')
const { generateAccessToken, generateRefreshToken } = require('../helpers')
const db = require('../database')

exports.handleRefresh = (request, reply) => {
  const currentRefreshToken = request.body?.refreshToken

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

    const newUser = { userName: user.user_name, userId: user.user_id }
    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    await db.deleteRefreshToken(request)
    await db.createRefreshToken(accessToken, newUser.userId)

    return statusCode200(reply, { refreshToken, accessToken })
  })
}

exports.handleRegister = async (request, reply) => {
  const user = await db.getUser(request)

  if (user) {
    return statusCode404(reply)
  }

  const hashedPassword = await bcrypt.hash(request.body.userPassword, SALT_ROUNDS)
  const newUser = { ...request.body, userPassword: hashedPassword }
  const accessToken = generateAccessToken(newUser)
  const userId = await db.createUser(newUser)
  const refreshToken = generateRefreshToken({ ...newUser, userId })

  await db.createRefreshToken(refreshToken, userId)

  return statusCode201(reply, { accessToken, refreshToken, userId })
}

exports.handleLogin = async (request, reply) => {
  const user = await db.getUser(request)

  if (!user) {
    return statusCode401(reply)
  }

  const isMatch = await bcrypt.compare(request.body.userPassword, user.user_password)

  if (!isMatch) {
    return statusCode401(reply)
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  const { user_name: userName, user_id: userId } = user

  await db.createRefreshToken(refreshToken, userId)

  return statusCode200(reply, {
    accessToken,
    refreshToken,
    userName,
    userId
  })
}

exports.handleLogout = async (request, reply) => {
  await db.deleteRefreshToken(request)

  return statusCode200(reply)
}