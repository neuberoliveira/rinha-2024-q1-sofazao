const http = require('http')

// Cria um servidor HTTP
const server = http.createServer((req, res) => {
  // Configurações do cabeçalho HTTP
  res.writeHead(200, {'Content-Type': 'text/plain'})

  // Corpo da resposta
  res.end('Hello, Node.js server!')
})

// Porta em que o servidor irá escutar
const port = 8080

// Inicia o servidor e escuta a porta especificada
server.listen(port, () => {
  console.log(`Servidor Node.js está ouvindo na porta ${port}`)
})
