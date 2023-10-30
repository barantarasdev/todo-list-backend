const {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  handleRefreshToken,
  handleLogout
} = require('./requestHandlers')
const { getReadFile } = require('./helpers/index')

function requestHandler(req, res) {
  const { url, method } = req
  const getTodosPattern = /^\/todos\/user\/\d+$/
  const manipulateTodosPattern = /^\/todos\/(\d+)$/
  const usersPath = './users.json'
  const todosPath = './todos.json'
  const USERS = getReadFile(usersPath)
  const TODOS = getReadFile(todosPath)
  let data = ''

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  req.on('data', chunk => {
    data += chunk.toString()
  })

  req.on('end', () => {
    if (data) {
      req.body = JSON.parse(data)
    }

    if (method === 'OPTIONS') {
      res.statusCode = 200

      return res.end()
    }

    if (url === '/refresh' && method === 'POST')
      return handleRefreshToken(res, req)

    if (url === '/login' && method === 'POST')
      return handleLogin(res, req, data, USERS)

    if (url === '/register' && method === 'POST')
      return handleRegister(res, data, USERS)

    if (url === '/logout' && method === 'POST')
      return handleLogout(res, req)

    if (url === '/todos' && method === 'POST')
      return handleNewTodo(res, req, data)

    if (getTodosPattern.test(url) && method === 'POST')
      return handleGetTodos(res, req, TODOS)

    if (manipulateTodosPattern.test(url))
      return handleChangeTodo(res, req, data, TODOS)

    res.statusCode = 404
    return res.end()
  })
}

module.exports = requestHandler
