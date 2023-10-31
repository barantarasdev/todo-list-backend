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
      user_age: { type: 'number', minimum: 18, maximum: 60 },
      user_email: { type: 'string', format: 'email' },
      user_phone: { type: 'string', pattern: '^\\+?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$' },
      user_site: { type: 'string', pattern: '^(https?:\\/\\/)?(?!www\\.)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$' },
      user_password: { type: 'string', pattern: '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\\s).{6,15}$' },
      user_confirm_password: { type: 'string' },
      user_name: { type: 'string', minLength: 2 }
    },
    required: ['user_age', 'user_email', 'user_phone', 'user_site', 'user_password', 'user_name', 'user_confirm_password']
  }
}

exports.todoSchema = {
  type: 'object',
  required: ['todo_value']
}