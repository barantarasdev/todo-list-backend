const {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  handleRefreshToken,
  handleLogout
} = require('../controllers')
const { statusCode200, statusCode404 } = require('../statusCodes')
const { URL_TODOS_PATTERN, URL_MANIPULATE_TODOS_PATTERN } = require('../constants')

function requestHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_URL)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  const { url, method } = req
  let data = ''

  req.on('data', chunk => {
    data += chunk.toString()
  })

  req.on('end', () => {
    let parsedData

    if (data) {
      parsedData = JSON.parse(data)
      req.body = parsedData
    }

    if (method === 'OPTIONS')
      return statusCode200(res)

    if (url === '/refresh' && method === 'POST')
      return handleRefreshToken(res, req)

    if (url === '/login' && method === 'POST')
      return handleLogin(res, req, parsedData)

    if (url === '/register' && method === 'POST')
      return handleRegister(res, parsedData)

    if (url === '/logout' && method === 'POST')
      return handleLogout(res, req)

    if (url === '/todos' && method === 'POST')
      return handleNewTodo(res, req, parsedData)

    if (URL_TODOS_PATTERN.test(url) && method === 'POST')
      return handleGetTodos(res, req)

    if (URL_MANIPULATE_TODOS_PATTERN.test(url))
      return handleChangeTodo(res, req, parsedData)

    return statusCode404(res)
  })
}

module.exports = requestHandler
