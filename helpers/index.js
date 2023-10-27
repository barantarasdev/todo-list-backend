const fs = require('fs')
const jwt = require('jsonwebtoken')

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
  const token = bearerHeader && bearerHeader.split(' ')[1]

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
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: '10s' })
}

module.exports = {
  getReadFile,
  setNewValue,
  setNewFile,
  findUser,
  verifyToken,
  generateAccessToken
}