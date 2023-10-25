const fs = require("fs");

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

function handleLogin(res, data, USERS, TODOS) {
  const parsedLoginData = JSON.parse(data)
  const foundUser = USERS.find(({email, password}) => email === parsedLoginData.email && password === parsedLoginData.password)

  if (foundUser) {
    const currentTodos = TODOS.filter(({userId}) => userId === foundUser.userId)

    res.statusCode = 200

    return res.end(JSON.stringify({user: foundUser, todos: currentTodos}))
  }

  res.statusCode = 401
  return res.end()
}

function handleRegister(res, data, USERS) {
  const parsedRegisterData = JSON.parse(data)

  const foundUser = USERS.find(({email, password}) => email === parsedRegisterData.email)

  if (foundUser) {
    res.statusCode = 409

    return res.end()
  }

  setNewValue(usersPath, parsedRegisterData)
  res.statusCode = 201

  return res.end(JSON.stringify({message: 'Success'}))
}

function handleNewTodo(res, data) {
  const parsedData = JSON.parse(data)

  setNewValue(todosPath, parsedData)
  res.statusCode = 201

  return res.end(JSON.stringify({message: 'Success'}))
}

function handleGetTodos(res, req, TODOS) {
  const id = +req.url.split('/').pop()
  const filteredTodos = TODOS.filter(({userId}) => userId === id)

  res.statusCode = 200

  return res.end(JSON.stringify({todos: filteredTodos}))
}

function handleChangeTodo(res, req, data, TODOS) {
  const id = +req.url.split('/').pop()

  switch (req.method) {
    case 'PATCH':
      const parsedData = JSON.parse(data)
      const newTodos = TODOS.map(todo => todo.id === id ? {...todo, ...parsedData} : todo)
      setNewFile(todosPath, newTodos)

      res.statusCode = 200

      return res.end(JSON.stringify({message: 'Success'}))
    case 'DELETE':
      const filteredTodo = TODOS.filter(todo => todo.id !== id)
      setNewFile(todosPath, filteredTodo)

      res.statusCode = 200

      return res.end(JSON.stringify({message: 'Success'}))
    default:
      return res.end();
  }
}

module.exports = {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  getReadFile,
};