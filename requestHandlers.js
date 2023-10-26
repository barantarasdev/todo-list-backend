const fs = require("fs");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const usersPath = './users.json'
const todosPath = './todos.json'
let refreshTokens = [];
const SALT_ROUNDS = 10;

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

function findUser(users, email) {
  return users.find((user) => email === user.email)
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']
  const token = bearerHeader && bearerHeader.split(' ')[1];

  if (!token) {
    res.statusCode = 401
    return res.end()
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err) => {
    if (err) {
      res.statusCode = 403
      return res.end()
    }

    next()
  })
}

function generateAccessToken(user) {
  return  jwt.sign(user, process.env.ACCESS_SECRET_KEY, {expiresIn: '25s'})
}

function handleRegister(res, data, USERS) {
  const parsedRegisterData = JSON.parse(data)

  const foundUser = findUser(USERS, parsedRegisterData.email)

  if (foundUser) {
    res.statusCode = 409

    return res.end()
  }

  bcrypt.hash(parsedRegisterData.password, SALT_ROUNDS, function(err, hash) {
    if (err) {
      res.statusCode = 500;
      return res.end();
    }

    const userWithHashedPassword = {
      ...parsedRegisterData,
      password: hash
    };

    setNewValue(usersPath, userWithHashedPassword)

    const accessToken = generateAccessToken(parsedRegisterData);
    const refreshToken = jwt.sign(parsedRegisterData, process.env.REFRESH_SECRET_KEY);

    refreshTokens.push(refreshToken)

    res.statusCode = 201
    return res.end(JSON.stringify({accessToken, refreshToken}))
  });
}

function handleNewTodo(res, req, data) {
  verifyToken(req, res, () => {
    const parsedData = JSON.parse(data)

    setNewValue(todosPath, parsedData)

    res.statusCode = 201
    return res.end(JSON.stringify({message: 'Success'}))
  })
}

function handleChangeTodo(res, req, data, TODOS) {
  verifyToken(req, res, () => {
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
  })
}

function handleGetTodos(res, req, TODOS) {
  verifyToken(req, res, () => {
    const id = +req.url.split('/').pop()
    const filteredTodos = TODOS.filter(({userId}) => userId === id)

    res.statusCode = 200
    return res.end(JSON.stringify({todos: filteredTodos}))
  })
}

function handleRefreshToken(res, req) {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ message: 'No token provided' }));
  }

  if (!refreshTokens.includes(refreshToken)) {
    res.statusCode = 403;
    return res.end();
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) {
      res.statusCode = 403;
      return res.end();
    }

    const accessToken = generateAccessToken({ name: user.name, userId: user.userId });
    const refreshToken = jwt.sign({ name: user.name, userId: user.userId }, process.env.REFRESH_SECRET_KEY);

    refreshTokens.push(refreshToken)

    res.statusCode = 200;
    return res.end(JSON.stringify({ accessToken, refreshToken }));
  });
}

function handleLogin(res, req, data, USERS) {
  const parsedLoginData = JSON.parse(data)
  const foundUser = findUser(USERS, parsedLoginData.email)

  if (!foundUser) {
    res.statusCode = 401
    return res.end(JSON.stringify({message: "Not found user"}))
  }

  bcrypt.compare(parsedLoginData.password, foundUser.password, (err, isMatch) => {
    if (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Internal server error' }));
    }

    if (!isMatch) {
      res.statusCode = 401;
      return res.end(JSON.stringify({message: "Invalid credentials"}));
    }

    const accessToken = generateAccessToken(foundUser);
    const refreshToken = jwt.sign(foundUser, process.env.REFRESH_SECRET_KEY);
    refreshTokens.push(refreshToken);

    res.statusCode = 200;
    return res.end(JSON.stringify({accessToken, refreshToken, name: foundUser.name, userId: foundUser.userId}))
  })
}

function handleLogout(res, req) {
  const token = req.body.token;
  refreshTokens = refreshTokens.filter(item => item !== token);

  res.statusCode = 200
  return res.end(JSON.stringify({message: 'Success'}))
}

module.exports = {
  handleLogin,
  handleRegister,
  handleNewTodo,
  handleGetTodos,
  handleChangeTodo,
  handleLogout,
  handleRefreshToken,
  getReadFile
};