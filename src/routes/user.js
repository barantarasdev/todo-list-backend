const {
  handleGetBoards,
  handleCreateBoards,
} = require('../controllers/columns')
const {
  handleLogin,
  handleRegister,
  handleLogout,
  handleRefresh,
  handleInviteFriend,
} = require('../controllers/user')
const { registerSchema } = require('../middlewares')

module.exports = function (fastify, _, done) {
  fastify.register(
    (app, _, done) => {
      app.post('/login', handleLogin)
      app.post('/register', { schema: registerSchema }, handleRegister)
      app.post('/logout', handleLogout)
      app.post('/refresh', handleRefresh)
      app.post('/invite', handleInviteFriend)

      done()
    },
    { prefix: '/auth' }
  )

  fastify.get('/boards/:id', handleGetBoards)
  fastify.post('/boards/:id', handleCreateBoards)

  done()
}
