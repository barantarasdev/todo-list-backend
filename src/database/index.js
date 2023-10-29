const { Client } = require('pg')

async function requestToDB(text, values) {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  })

  try {
    await client.connect()
    const res = await client.query(text, values)

    return res.rows
  } catch (err) {
    console.error(err.message)
    throw Error
  } finally {
    await client.end()
  }
}

module.exports = {
  requestToDB
}
