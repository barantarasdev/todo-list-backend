const http = require('http');
const PORT = 3000

const server = http.createServer((req, res) => {
  console.log('Server')
})

server.listen(PORT, (error) => {
  console.log(error ? error : `listening port ${PORT}`)
})