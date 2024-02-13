const database = require('../database/couchdb.js')

async function statementHandler(context){
	const response = {
		status: 200,
		headers: {},
		response: '',
	}
	
	const id = context.id
	const entry = await database.find(id)
	
	if(entry.error){
		response.status = 404
		return response
	}
	const result = {
		saldo: {
			total: entry.total,
			limite: entry.limite,
			data_extrato: (new Date()).toISOString(),
		},
		ultimas_transacoes: entry.ultimas_transacoes
	}
	
	response.headers = {'content-type': 'application/json'}
	response.response = JSON.stringify(result)
	return response
}

module.exports = statementHandler
