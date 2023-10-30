const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
  findUser,
  verifyToken,
  generateAccessToken, getId, storeRefreshToken, removeRefreshToken, verifyRefreshToken
} = require('../helpers')
const { requestToDB } = require('../database')
const { statusCode201, statusCode200, statusCode401, statusCode403, statusCode404 } = require('../statusCodes')
const { SALT_ROUNDS } = require('../constants')

function handleNewTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const { todo_completed, todo_value, user_id } = data
    const queryText = `
        INSERT INTO todos(user_id, todo_value, todo_completed) 
        VALUES($1, $2, $3) RETURNING todo_id`
    const values = [user_id, todo_value, todo_completed]
    const result = await requestToDB(queryText, values)
    const todo_id = result[0].todo_id

    return statusCode201(res, { todo_id })
  })
}

function handleChangeTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const id = getId(req)

    switch (req.method) {
      case 'PATCH':
        const values = Object.values(data)
        const updates = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ')
        const updateQuery = `
          UPDATE todos 
          SET ${updates}
          WHERE todo_id = $${values.length + 1}
        `
        await requestToDB(updateQuery, [...values, id])

        return statusCode200(res)
      case 'DELETE':
        await requestToDB(`DELETE FROM todos WHERE todo_id = $1`, [id])

        return statusCode200(res)
      default:
        return statusCode404(res)
    }
  })
}

function handleGetTodos(res, req) {
  verifyToken(req, res, async () => {
    const id = getId(req)
    const todosFromDB = await requestToDB('SELECT * FROM todos ORDER BY createdAt')
    const todos = todosFromDB.filter(({ user_id }) => user_id === id)

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

    const verifiedToken = await verifyRefreshToken(currentRefreshToken)

    if (!verifiedToken) {
      return statusCode403(res)
    }

    const newUser = { user_name: user.user_name, user_id: user.user_id }
    const accessToken = generateAccessToken(newUser)
    const refreshToken = jwt.sign(newUser, process.env.REFRESH_SECRET_KEY)
    await removeRefreshToken(currentRefreshToken)
    await storeRefreshToken(refreshToken, newUser.user_id)

    return statusCode200(res, { accessToken, refreshToken })
  })
}

async function handleRegister(res, data) {
  const foundUser = await findUser(data.user_email)

  if (foundUser) {
    return statusCode404(res)
  }

  const hash = await bcrypt.hash(data.user_password, SALT_ROUNDS)
  const { user_name, user_email, user_password, user_phone, user_age, user_gender, user_site } = {
    ...data,
    user_password: hash
  }

  const queryText = `
        INSERT INTO users(user_name, user_email, user_password, user_phone, user_age, user_gender, user_site) 
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`
  const values = [user_name, user_email, user_password, user_phone, user_age, user_gender, user_site]
  const accessToken = generateAccessToken(data)
  const refreshToken = jwt.sign(data, process.env.REFRESH_SECRET_KEY)
  const result = await requestToDB(queryText, values)
  const user_id = result[0].user_id

  storeRefreshToken(refreshToken, user_id)

  return statusCode201(res, { accessToken, refreshToken, user_id })
}

async function handleLogin(res, req, data) {
  const { user_email, user_password } = data
  const foundUser = await findUser(user_email)

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

  await storeRefreshToken(refreshToken, user_id)

  return statusCode200(res, {
    accessToken,
    refreshToken,
    user_name,
    user_id
  })
}

async function handleLogout(res, req) {
  const token = req.body.token
  await removeRefreshToken(token)

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