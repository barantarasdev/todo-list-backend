const jwt = require('jsonwebtoken')
const { requestToDB } = require('../database')
const { statusCode401, statusCode403 } = require('../statusCodes')
const { ACCESS_TOKEN_EXPIRES } = require('../constants')

async function findUser(email) {
  const users = await requestToDB('SELECT * FROM users')

  return users.find(({ user_email }) => email === user_email)
}

function getId(req) {
  return req.url.split('/').pop()
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']
  const token = bearerHeader && bearerHeader.split(' ')[1]

  if (!token) {
    return statusCode401(res)
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err) => {
    if (err) {
      return statusCode403(res)
    }

    next()
  })
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES })
}

async function storeRefreshToken(token, user_id) {
  const queryText = 'INSERT INTO refresh_tokens(user_id, token) VALUES($1, $2)'
  await requestToDB(queryText, [user_id, token])
}

async function verifyRefreshToken(token) {
  const queryText = 'SELECT * FROM refresh_tokens WHERE token = $1'
  const tokens = await requestToDB(queryText, [token])
  return tokens.length
}

async function removeRefreshToken(token) {
  const queryText = 'DELETE FROM refresh_tokens WHERE token = $1'
  await requestToDB(queryText, [token])
}

module.exports = {
  findUser,
  getId,
  verifyToken,
  generateAccessToken,
  storeRefreshToken,
  verifyRefreshToken,
  removeRefreshToken
}