const fs = require('fs')

const usersPath = './users.json'
const todosPath = './todos.json'

function getReadFile(filePath) {
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8')

    return JSON.parse(fileData)
  } catch (error) {
    console.log(error)
  }
}

function setNewValue(filePath, newData) {
  let data = []

  try {
    const fileData = fs.readFileSync(filePath, 'utf-8')
    data = JSON.parse(fileData)
  } catch (error) {
    console.log(error)
  }

  data.push(newData)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.log(error)
  }
}

function setNewFile(filePath, newData) {
  try {
    fs.writeFileSync(filePath, JSON.stringify([...newData], null, 2), 'utf-8')
  } catch (error) {
    console.log(error)
  }
}

function requestHandler(req, res) {
  const {url, method} = req
  const getTodosPattern = /^\/todos\/user\/\d+$/
  const manipulateTodosPattern = /^\/todos\/(\d+)$/

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') {
    res.statusCode = 200;

    return res.end();
  }

  if (url === '/login' && method === 'POST') {
    let data = ''

    req.on('data', chunk => {
      data += chunk.toString()
    })

    req.on('end', () => {
      const parsedData = JSON.parse(data)
      const fileData = getReadFile(usersPath)
      const fileDataTodos = getReadFile(todosPath)

      const foundUser = fileData.find(({email, password}) => email === parsedData.email && password === parsedData.password)

      if (foundUser) {
        const currentTodos = fileDataTodos.filter(({userId}) => userId === foundUser.userId)

        res.statusCode = 200

        return res.end(JSON.stringify({user: foundUser, todos: currentTodos}))
      }

      res.statusCode = 401
      return res.end()
    })

    return;
  }

  if (url === '/register' && method === 'POST') {
    let data = ''

    req.on('data', chunk => {
      data += chunk.toString()
    })

    req.on('end', () => {
      const parsedData = JSON.parse(data)
      const fileData = getReadFile(usersPath)
      const foundUser = fileData.find(({email}) => email === parsedData.email)

      if (foundUser) {
        res.statusCode = 409

        return res.end()
      }

      setNewValue(usersPath, parsedData)
      res.statusCode = 201

      return res.end(JSON.stringify({message: 'Success'}))
    })

    return
  }

  if (url === '/todos' && method === 'POST') {
    let data = ''

    req.on('data', chunk => {
      data += chunk.toString()
    })

    req.on('end', () => {
      const parsedData = JSON.parse(data)

      setNewValue(todosPath, parsedData)
      res.statusCode = 201

      return res.end(JSON.stringify({message: 'Success'}))
    })

    return
  }

  if (getTodosPattern.test(url) && method === 'GET') {
    const id = +url.split('/').pop()
    const todos = getReadFile(todosPath)
    const filteredTodos = todos.filter(({userId}) => userId === id)

    res.statusCode = 200

    return res.end(JSON.stringify({todos: filteredTodos}))
  }

  if (manipulateTodosPattern.test(url)) {
    const id = +url.split('/').pop()
    const todos = getReadFile(todosPath)

    switch (method) {
      case 'PATCH':
        let data = ''

        req.on('data', chunk => {
          data += chunk.toString()
        })

        req.on('end', () => {
          const parsedData = JSON.parse(data)
          const newTodos = todos.map(todo => todo.id === id ? {...todo, ...parsedData} : todo)
          setNewFile(todosPath, newTodos)

          res.statusCode = 200

          return res.end(JSON.stringify({message: 'Success'}))
        })

        break;
      case 'DELETE':
        const newTodos = todos.filter(todo => todo.id !== id)
        setNewFile(todosPath, newTodos)

        res.statusCode = 200

        return res.end(JSON.stringify({message: 'Success'}))
      default:
        return res.end();
    }

    return;
  }

  res.statusCode = 404

  return res.end();
}

module.exports = requestHandler
