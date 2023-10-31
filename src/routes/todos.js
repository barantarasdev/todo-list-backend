const {
  handleGetTodos,
  handleCreateTodo,
  handleUpdateTodo,
  handleDeleteTodo
} = require('../controllers/todos')
const { verifyToken, todoSchema } = require('../middlewares')

module.exports = function(fastify, options, done) {
  fastify.addHook('preHandler', verifyToken)

  fastify.register((app, _, done) => {
    app.post('/', { schema: todoSchema }, handleCreateTodo)
    app.patch('/:id', { schema: todoSchema }, handleUpdateTodo)
    app.delete('/:id', handleDeleteTodo)

    done()
  }, { prefix: '/todos' })

  fastify.get('/users/:id/todos', handleGetTodos)

  done()
}