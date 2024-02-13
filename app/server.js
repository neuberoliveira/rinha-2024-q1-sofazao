const http = require('http')
const setup = require('./database/couchdb.js').setup
const statementHandler = require('./handler/statementHandler.js')
const transactionHandler = require('./handler/transactionHandler.js')

const {DOCKER_API1_PORT} = process.env

setup()

// Cria um servidor HTTP
const server = http.createServer(async (req, res) => {
  const urlPieces = req.url.split('/')
  urlPieces.shift()
  
  const isMethodGet = req.method === 'GET'
  const isMethodPost = req.method === 'POST'
  
  const section = urlPieces[0] ?? null
  const id = urlPieces[1] ? parseInt(urlPieces[1]) : null
  const action = urlPieces[2] ?? null
  
  const isCustomer = section==='clientes'
  const isTransaction = action==='transacoes'
  const isStatement = action==='extrato'
  const context = {id, body: undefined}
  
  if(!isCustomer && (!isTransaction || !isStatement) && !id){
    errorResponse(res)
    return
  }
  
  let result
  if(isStatement && isMethodGet){
    result = await statementHandler(context)
  }else if(isTransaction && isMethodPost){
    result = await transactionHandler(context)
  }
  
  if(result){
    res.writeHead(result.status, result.headers)
    res.end(result.response)
    return
  }
  
  errorResponse(res)
})


// Inicia o servidor e escuta a porta especificada
server.listen(DOCKER_API1_PORT, () => {
  console.log(`Server running on http://localhost:${DOCKER_API1_PORT}`)
})

function errorResponse(res){
  res.writeHead(404, {'Content-Type': 'text/plain'})
  res.end()
}
