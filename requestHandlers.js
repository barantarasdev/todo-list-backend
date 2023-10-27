const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
  findUser,
  verifyToken,
  generateAccessToken
} = require('./helpers/index')
const { requestFromDB } = require('./database')

let refreshTokens = []
const SALT_ROUNDS = 10

function handleNewTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const { todo_completed, todo_value, user_id } = JSON.parse(data)

    const queryText = `
        INSERT INTO todos(user_id, todo_value, todo_completed) 
        VALUES($1, $2, $3) RETURNING todo_id`
    const values = [user_id, todo_value, todo_completed]
    const result = await requestFromDB(queryText, values)

    res.statusCode = 201
    return res.end(JSON.stringify({ todo_id: result[0].todo_id }))
  })
}

async function handleChangeTodo(res, req, data) {
  verifyToken(req, res, async () => {
    const id = req.url.split('/').pop()

    switch (req.method) {
      case 'PATCH':
        const parsedData = JSON.parse(data)
        const values = Object.values(parsedData)

        const updates = Object.keys(parsedData).map((key, index) => `${key} = $${index + 1}`).join(', ')
        const updateQuery = `
          UPDATE todos 
          SET ${updates}
          WHERE todo_id = $${values.length + 1}
        `

        await requestFromDB(updateQuery, [...values, id])

        res.statusCode = 200
        return res.end(JSON.stringify({ message: 'Success' }))

      case 'DELETE':
        await requestFromDB(`DELETE FROM todos WHERE todo_id = '${id}'`)

        res.statusCode = 200
        return res.end(JSON.stringify({ message: 'Success' }))

      default:
        return res.end()
    }
  })
}

function handleGetTodos(res, req) {
  verifyToken(req, res, async () => {
    try {
      const todos = await requestFromDB('SELECT * FROM todos ORDER BY createdAt')
      const id = req.url.split('/').pop()
      const filteredTodos = todos.filter(({ user_id }) => user_id === id)

      res.statusCode = 200
      return res.end(JSON.stringify({ todos: filteredTodos }))
    } catch (error) {
      console.log(error)
      return res.end()
    }
  })
}

function handleRefreshToken(res, req) {
  const refreshToken = req.body.token

  if (!refreshToken) {
    res.statusCode = 401
    return res.end(JSON.stringify({ message: 'No token provided' }))
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, { user_name, user_id }) => {
    if (err) {
      res.statusCode = 403
      return res.end()
    }

    const refreshTokenIndex = refreshTokens.findIndex((token) => token === refreshToken)
    if (refreshTokenIndex === -1) {
      res.statusCode = 403
      return res.end()
    }

    refreshTokens.splice(refreshTokenIndex, 1)
    const newUser = { user_name, user_id }

    const accessToken = generateAccessToken(newUser)
    const newRefreshToken = jwt.sign(newUser, process.env.REFRESH_SECRET_KEY)

    refreshTokens.push(newRefreshToken)

    res.statusCode = 200
    return res.end(JSON.stringify({ accessToken, refreshToken: newRefreshToken }))
  })
}

async function handleRegister(res, data) {
  const parsedRegisterData = JSON.parse(data)
  const foundUser = await findUser(parsedRegisterData.user_email)

  if (foundUser) {
    res.statusCode = 404

    return res.end()
  }

  const hash = await bcrypt.hash(parsedRegisterData.user_password, SALT_ROUNDS)
  const { user_name, user_email, user_password, user_phone, user_age, user_gender, user_site } = {
    ...parsedRegisterData,
    user_password: hash
  }

  const queryText = `
        INSERT INTO users(user_name, user_email, user_password, user_phone, user_age, user_gender, user_site) 
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`
  const values = [user_name, user_email, user_password, user_phone, user_age, user_gender, user_site]
  const accessToken = generateAccessToken(parsedRegisterData)
  const refreshToken = jwt.sign(parsedRegisterData, process.env.REFRESH_SECRET_KEY)
  const result = await requestFromDB(queryText, values)

  refreshTokens.push(refreshToken)

  res.statusCode = 201
  return res.end(JSON.stringify({ accessToken, refreshToken, user_id: result[0].user_id }))
}

async function handleLogin(res, req, data) {
  const { user_email, user_password } = JSON.parse(data)
  const foundUser = await findUser(user_email)

  if (!foundUser) {
    res.statusCode = 401
    return res.end(JSON.stringify({ message: 'Not found user' }))
  }

  const isMatch = bcrypt.compare(user_password, foundUser.user_password)
  if (!isMatch) {
    res.statusCode = 401
    return res.end(JSON.stringify({ message: 'Invalid credentials' }))
  }

  const accessToken = generateAccessToken(foundUser)
  const refreshToken = jwt.sign(foundUser, process.env.REFRESH_SECRET_KEY)
  refreshTokens.push(refreshToken)

  res.statusCode = 200
  return res.end(JSON.stringify({
    accessToken,
    refreshToken,
    user_name: foundUser.user_name,
    user_id: foundUser.user_id
  }))
}

function handleLogout(res, req) {
  const token = req.body.token
  refreshTokens = refreshTokens.filter(item => item !== token)

  res.statusCode = 200
  return res.end(JSON.stringify({ message: 'Success' }))
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