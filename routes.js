const {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  getReadFile
} = require('./requestHandlers')

const usersPath = './users.json'
const todosPath = './todos.json'

function requestHandler(req, res) {
  const {url, method} = req
  const getTodosPattern = /^\/todos\/user\/\d+$/
  const manipulateTodosPattern = /^\/todos\/(\d+)$/
  const USERS = getReadFile(usersPath)
  const TODOS = getReadFile(todosPath)
  let data = ''

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  req.on('data', chunk => {
    data += chunk.toString()
  })

  req.on('end', () => {
    if (method === 'OPTIONS') {
      res.statusCode = 200;

      return res.end();
    }

    if (url === '/login' && method === 'POST') {
      handleLogin(res, data, USERS, TODOS)

      return
    }

    if (url === '/register' && method === 'POST') {
      handleRegister(res, data, USERS)

      return
    }

    if (url === '/todos' && method === 'POST') {
      handleNewTodo(res, data)

      return
    }

    if (getTodosPattern.test(url) && method === 'GET') {
      handleGetTodos(res, req, TODOS)

      return
    }

    if (manipulateTodosPattern.test(url)) {
      handleChangeTodo(res, req, data, TODOS)

      return
    }

    res.statusCode = 404
    return res.end();
  })
}

module.exports = requestHandler
