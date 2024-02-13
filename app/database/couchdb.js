const {DATABASE_USER, DATABASE_PASS, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME} = process.env
const auth = Buffer.from(`${DATABASE_USER}:${DATABASE_PASS}`).toString('base64')

function wrapperDb({
  method,
  body,
  id,
  rev,
}){
  let resource = `http://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`
  const params = {
    method,
    'headers': {
      'Authorization': `Basic ${auth}`,
    }
  }
  
  if(body){
    params.body = body
  }
  if(id){
    resource += `/${id}`
  }
  if(rev){
    resource += `?rev=${rev}`
  }
  
  return new Promise(async (resolve, reject)=>{
    const result = await fetch(resource, params).then(r=>r.json())
    
    /* if(result.error && result.error !== 'file_exists'){
      console.log('DATABASE ERROR')
      console.log(result)
      reject(result)
    }else{
      resolve(result)      
    } */
    resolve(result)
  })
}

function find(id){
  return wrapperDb({
    id,
    method: 'GET',
  })
}

function update(entry){
  return wrapperDb({
    id: entry._id,
    rev: entry._rev,
    method: 'PUT',
    body: JSON.stringify(entry),
  })
}

function createDatabase(){
  // console.log('create database')
  return wrapperDb({
    method: 'PUT',
    body: `{\"id\":\"${DATABASE_NAME}\",\"name\":\"${DATABASE_NAME}\"}`,
  })
}

function createUser({id, limit}){
  // console.log('create user')
  return wrapperDb({
    id,
    method: 'PUT',
    body: JSON.stringify({
      limite: limit,
      total: 0,
      ultimas_transacoes: [],
    }),
  }) 
}

async function setup(){
  await createDatabase()
  await Promise.all([
    createUser({id:1, limit: 100000}),
    createUser({id:2, limit: 80000}),
    createUser({id:3, limit: 1000000}),
    createUser({id:4, limit: 10000000}),
    createUser({id:5, limit: 500000}),
  ])
}

module.exports = {
  find,
  update,
  setup,
}
