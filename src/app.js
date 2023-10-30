const http = require('http')
require('dotenv').config()

const routes = require('./routes')

const server = http.createServer(routes)

server.listen(process.env.PORT)
