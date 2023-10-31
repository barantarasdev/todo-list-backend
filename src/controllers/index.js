const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
  verifyToken,
  generateAccessToken, getId
} = require('../helpers')
const db = require('../database')
const { statusCode201, statusCode200, statusCode401, statusCode403, statusCode404 } = require('../statusCodes')
const { SALT_ROUNDS } = require('../constants')

function handleNewTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const todo_id = await db.createTodo(data)

    return statusCode201(res, { todo_id })
  })
}

function handleChangeTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const id = getId(req)

    switch (req.method) {
      case 'PATCH':
        await db.changeTodo(data, id)

        return statusCode200(res)
      case 'DELETE':
        await db.removeTodo(id)

        return statusCode200(res)
      default:
        return statusCode404(res)
    }
  })
}

function handleGetTodos(res, req) {
  verifyToken(req, res, async () => {
    const id = getId(req)
    const todos = await db.getTodos(id)

    return statusCode200(res, { todos })
  })
}

function handleRefreshToken(res, req) {
  const currentRefreshToken = req.body.token

  if (!currentRefreshToken) {
    return statusCode401(res)
  }

  jwt.verify(currentRefreshToken, process.env.REFRESH_SECRET_KEY, async (err, user) => {
    if (err) {
      return statusCode403(res)
    }

    const verifiedToken = await db.verifyRefreshToken(currentRefreshToken)

    if (!verifiedToken) {
      return statusCode403(res)
    }

    const newUser = { user_name: user.user_name, user_id: user.user_id }
    const accessToken = generateAccessToken(newUser)
    const refreshToken = jwt.sign(newUser, process.env.REFRESH_SECRET_KEY)
    await db.removeRefreshToken(currentRefreshToken)
    await db.storeRefreshToken(refreshToken, newUser.user_id)

    return statusCode200(res, { accessToken, refreshToken })
  })
}

async function handleRegister(res, data) {
  const foundUser = await db.getUser(data.user_email)

  if (foundUser) {
    return statusCode404(res)
  }

  const hash = await bcrypt.hash(data.user_password, SALT_ROUNDS)
  const user = { ...data, user_password: hash }
  const accessToken = generateAccessToken(data)
  const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY)
  const user_id = await db.signUp(user)

  await db.storeRefreshToken(refreshToken, user_id)

  return statusCode201(res, { accessToken, refreshToken, user_id })
}

async function handleLogin(res, req, data) {
  const { user_email, user_password } = data
  const foundUser = await db.getUser(user_email)

  if (!foundUser) {
    return statusCode401(res)
  }

  const isMatch = await bcrypt.compare(user_password, foundUser.user_password)

  if (!isMatch) {
    return statusCode401(res)
  }

  const accessToken = generateAccessToken(foundUser)
  const refreshToken = jwt.sign(foundUser, process.env.REFRESH_SECRET_KEY)
  const { user_name, user_id } = foundUser

  await db.storeRefreshToken(refreshToken, user_id)

  return statusCode200(res, {
    accessToken,
    refreshToken,
    user_name,
    user_id
  })
}

async function handleLogout(res, req) {
  const token = req.body.token
  await db.removeRefreshToken(token)

  return statusCode200(res)
}

module.exports = {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  handleLogout,
  handleRefreshToken
}