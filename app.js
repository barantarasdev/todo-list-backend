const http = require('http');
const PORT = 3000
let todos = [
  {
    value: 'Taras',
    isChecked: false,
    id: 12,
    userId: 1
  }
]
const USERS = [{name: 'Taras',
  userId: 1,
  email: 't@t.com',
  password: '123',
  phone: '123123123',
  age: '18',
  gender: 'm',
  site: '...'
}]

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  const {url, method} = req;

  if (url === '/todos') {
    if (method === 'POST') {
      let newTodo = ''

      req.on('data', chunk => {
        newTodo += chunk.toString()
      })

      req.on('end', () => {
        const parsedTodo = JSON.parse(newTodo)

        todos.push(parsedTodo)
        res.statusCode = 201
        res.end(JSON.stringify(parsedTodo))
      })
    }

    return;
  }

  if (/^\/todos\/user\/\d+$/.test(url)) {
    if (method === 'GET') {
      const id = +url.split('/').pop()

      const filteredTodos = todos.filter(({userId}) => userId === id)
      res.statusCode = 200
      res.end(JSON.stringify({todos: filteredTodos}))
    }

    return;
  }

  if (url === '/login') {
    if (method === 'POST') {
      let data = ''

      req.on('data', chunk => {
        data += chunk.toString()
      })

      req.on('end', () => {
        const parsedData = JSON.parse(data)
        const foundUser = USERS.find(user => user.email === parsedData.email && user.password === parsedData.password)

        if (foundUser) {
          const currentTodos = todos.filter(todo => todo.userId === foundUser.userId)

          res.statusCode = 200
          res.end(JSON.stringify({user: foundUser, todos: currentTodos}))
        } else {
          res.end()
        }
      })
    }

    return;
  }

  if (url === '/register') {
    if (method === 'POST') {
      let data = ''

      req.on('data', chunk => {
        data += chunk.toString()
      })

      req.on('end', () => {
        const parsedData = JSON.parse(data)
        const foundUser = USERS.find(user => user.email === parsedData.email)

        if (foundUser) {
          res.statusCode = 409
          res.end()
        } else {
          res.statusCode = 201
          USERS.push(parsedData)
          res.end(JSON.stringify(parsedData))
        }
      })
    }

    return;
  }

  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (/^\/todos\/(\d+)$/.test(url)) {
    const id = +url.split('/').pop()

    switch (method) {
      case 'PATCH':
        let changedTodo = ''

        req.on('data', chunk => {
          changedTodo += chunk.toString()
        })

        req.on('end', () => {
          const parsedTodo = JSON.parse(changedTodo)

          todos = todos.map(todo => todo.id === id ? {...todo, ...parsedTodo} : todo)
          res.statusCode = 200
          res.end(JSON.stringify({message: 'Success'}))
        })

        break;
      case 'DELETE':
        todos = todos.filter(todo => todo.id !== +id)
        res.statusCode = 200
        res.end(JSON.stringify({message: 'Success'}))

        break;
      default:
        break;
    }

    return;
  }

  res.statusCode = 404
  res.end(JSON.stringify({ message: 'Not Found' }));
})

server.listen(PORT, (error) => {
  console.log(error ? error : `listening port ${PORT}`)
})
