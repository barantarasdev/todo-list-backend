const {
  handleGetTodos,
  handleCreateTodo,
  handleUpdateTodo,
  handleDeleteTodo
} = require('../controllers/todos')
const { verifyToken, todoSchema } = require('../middlewares')

module.exports = function(fastify, options, done) {
  fastify.post('/todos/user/:id', { preHandler: verifyToken }, handleGetTodos)
  fastify.post('/todos', { preHandler: verifyToken, schema: todoSchema }, handleCreateTodo)
  fastify.patch('/todos/:id', { preHandler: verifyToken, schema: todoSchema }, handleUpdateTodo)
  fastify.delete('/todos/:id', { preHandler: verifyToken }, handleDeleteTodo)

  done()
}