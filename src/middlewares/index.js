const jwt = require('jsonwebtoken')
const { statusCode401, statusCode403 } = require('../statusCodes')

exports.verifyToken = (request, reply, done) => {
  const bearerHeader = request.headers.authorization
  const token = bearerHeader && bearerHeader.split(' ')[1]

  if (!token) {
    return statusCode401(reply)
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err) => {
    if (err) {
      return statusCode403(reply)
    }

    done()
  })
}

exports.registerSchema = {
  body: {
    type: 'object',
    properties: {
      userAge: { type: 'number', minimum: 18, maximum: 60 },
      userEmail: { type: 'string', format: 'email' },
      userPhone: { type: 'string', pattern: '^\\+?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$' },
      userSite: { type: 'string', pattern: '^(https?:\\/\\/)?(?!www\\.)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$' },
      userPassword: { type: 'string', pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\\s).{6,15}$' },
      userConfirmPassword: { type: 'string' },
      userName: { type: 'string', minLength: 2 }
    },
    required: ['userAge', 'userEmail', 'userPhone', 'userSite', 'userPassword', 'userName', 'userConfirmPassword']
  }
}

exports.todoSchema = {
  type: 'object',
  required: ['todoValue']
}