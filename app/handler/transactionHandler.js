const database = require('../database/couchdb.js')

async function transactionHandler(context){
	const response = {
		status: 200,
		headers: {},
		response: '',
	}
	
	const id = context.id
	const body = context.body
	/*
	{
	    "valor": 1000,
	    "tipo" : "c",
	    "descricao" : "descricao"
	}
	"ultimas_transacoes": [
    {
      "valor": 10,
      "tipo": "c",
      "descricao": "descricao",
      "realizada_em": "2024-01-17T02:34:38.543030Z"
    },
    {
      "valor": 90000,
      "tipo": "d",
      "descricao": "descricao",
      "realizada_em": "2024-01-17T02:34:38.543030Z"
    }
  ]
	*/
	const entry = await database.find(id)
	
	if(entry.error){
		response.status = 404
		return response
	}
	
	
	
	const result = {
		limite: entry.limite,
		saldo: entry.total,
	}
	
	entry.ultimas_transacoes.push({
      "valor": 10,
      "tipo": "c",
      "descricao": "descricao",
      "realizada_em": (new Date()).toISOString()
    })
	await database.update(entry)
	
	
	response.headers = {'content-type': 'application/json'}
	response.response = JSON.stringify(result)
	return response
}

module.exports = transactionHandler
