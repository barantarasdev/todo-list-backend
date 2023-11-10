const { verifyToken } = require('../middlewares')
const { handleCreateCol, handleUpdateCol, handleGetCols } = require('../controllers/cols')

module.exports = function(fastify, options, done) {
  fastify.addHook('preHandler', verifyToken)

  fastify.register((app, _, done) => {
    fastify.post('/cols', handleCreateCol)
    fastify.post('/cols/:id', handleUpdateCol)

    done()
  }, { prefix: '/cols' })

  fastify.get('/users/:id/cols', handleGetCols)

  done()
}