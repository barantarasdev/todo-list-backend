require('dotenv').config()
const fastify = require('fastify')()

fastify.register(require('@fastify/cors'), {
  origin: process.env.ALLOW_URL,
  methods: ['POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: true
})

fastify.register(require('./routes/user'))
fastify.register(require('./routes/todos'))
fastify.register(require('./routes/cols'))

fastify.listen({ port: process.env.PORT }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})