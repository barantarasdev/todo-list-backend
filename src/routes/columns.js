const { verifyToken } = require('../middlewares')
const {
  handleCreateColumn,
  handleUpdateColumn,
  handleGetColumns,
} = require('../controllers/columns')

module.exports = function (fastify, _, done) {
  fastify.addHook('preHandler', verifyToken)

  fastify.register(
    (app, _, done) => {
      app.post('/', handleCreateColumn)
      app.post('/:id', handleUpdateColumn)
      app.get('/:id', handleGetColumns)

      done()
    },
    { prefix: '/columns' }
  )

  done()
}
