const database = require('../database/couchdb.js')

function validateBody({tipo, descricao, valor}){
	const descLen = descricao.length
	const amount = parseInt(valor)
	return (
		(tipo==='c' || tipo==='d') &&
		(descLen>=1 && descLen<=10) &&
		(amount>=0)
	)
}

async function transactionHandler(context){
	const result = {
		status: 200,
		headers: {},
		response: '',
	}
	
	const id = context.id
	const body = context.body
	
	if(!validateBody(body)){
		result.status = 400
		result.response = 'manda os dados direito ae!!!!'
		return result
	}
	
	const type = body.tipo
	const amount = parseInt(body.valor)
	const description = body.descricao
	
	const isCredit = type==='c'
	const isDebit = type==='d'
	
	const entry = await database.find(id)
	
	if(entry.error){
		result.status = 404
		return result
	}
	
	
	let newAmount = 0
	if(isCredit){
		newAmount = entry.total + amount
	}	
	if(isDebit){
		newAmount = entry.total - amount
	}
	
	const minLimit = -Math.abs(entry.limite)
	if(newAmount < minLimit){
		result.status = 422
		result.response = '💰 💸'
		return result
	}
	
	entry.total = newAmount
	entry.ultimas_transacoes.unshift({
      "valor": amount,
      "tipo": type,
      "descricao": description,
      "realizada_em": (new Date()).toISOString()
    })
    entry.ultimas_transacoes = entry.ultimas_transacoes.slice(0, 10)	
	
	const response = {
		limite: entry.limite,
		saldo: entry.total,
	}	
	database.update(entry)
	
	
	result.headers = {'content-type': 'application/json'}
	result.response = JSON.stringify(response)
	return result
}

module.exports = transactionHandler
