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
  let bodyRaw = ''
  
  
  if(isTransaction && isMethodPost){
    req.on('data', (chunk) => {
      bodyRaw += chunk.toString();
    });

    req.on('end', async () => {
      if (req.headers['content-type'] === 'application/json') {
        try {
          context.body = JSON.parse(bodyRaw);
          result = await transactionHandler(context)
          successResponse(result, res)
          return
        } catch (error) {
          console.error('Error parsing JSON:', error);
          errorResponse(400, 'Invalid JSON data')
          return
        }
      }
    })
    
  }
  
  if(isStatement && isMethodGet){
    result = await statementHandler(context)
    successResponse(result, res)
    return
  }
})


// Inicia o servidor e escuta a porta especificada
server.listen(DOCKER_API1_PORT, () => {
  console.log(`Server running on http://localhost:${DOCKER_API1_PORT}`)
})

function errorResponse(res, message='', code=404){
  // console.log('error')
  res.writeHead(code, {'Content-Type': 'text/plain'})
  res.end(message)
}

function successResponse(result, res){
  if(!result){
    console.log('ops!')
    return
  }
  
  // console.log('success')
  res.writeHead(result.status, result.headers)
  res.end(result.response)
}
