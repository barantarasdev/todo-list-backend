const jwt = require('jsonwebtoken')
const { requestFromDB } = require('../database')

async function findUser(email) {
  const users = await requestFromDB('SELECT * FROM users')

  return users.find(({ user_email }) => email === user_email)
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
  findUser,
  verifyToken,
  generateAccessToken
}