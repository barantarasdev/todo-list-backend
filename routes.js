const {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  handleRefreshToken,
  handleLogout
} = require('./requestHandlers')

function requestHandler(req, res) {
  const { url, method } = req
  const getTodosPattern = /^\/todos\/user\/.+$/
  const manipulateTodosPattern = /^\/todos\/.+$/
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
      return handleLogin(res, req, data)

    if (url === '/register' && method === 'POST')
      return handleRegister(res, data)

    if (url === '/logout' && method === 'POST')
      return handleLogout(res, req)

    if (url === '/todos' && method === 'POST')
      return handleNewTodo(res, req, data)

    if (getTodosPattern.test(url) && method === 'POST')
      return handleGetTodos(res, req)

    if (manipulateTodosPattern.test(url))
      return handleChangeTodo(res, req, data)

    res.statusCode = 404
    return res.end()
  })
}

module.exports = requestHandler
