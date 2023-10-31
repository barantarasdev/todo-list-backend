const {
  handleLogin,
  handleRegister,
  handleLogout,
  handleRefresh
} = require('../controllers/user')
const { registerSchema } = require('../middlewares')

module.exports = function(fastify, options, done) {
  fastify.post('/login', handleLogin)
  fastify.post('/register', { schema: registerSchema }, handleRegister)
  fastify.post('/logout', handleLogout)
  fastify.post('/refresh', handleRefresh)

  done()
}