const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

class DataBase {
  requestToDB = async (text, values) => {
    const client = await pool.connect()

    try {
      const res = await client.query(text, values)

      return res.rows
    } catch (err) {
      console.error(err.message)
      throw Error
    } finally {
      await client.release()
    }
  }

  getUser = async (email) => {
    const user = await this.requestToDB(`
      SELECT * FROM users
      WHERE user_email = $1
    `, [email])

    return user[0]
  }

  getTodos = async (id) => {
    const todos = await this.requestToDB(`
      SELECT * FROM todos
      WHERE user_id = $1
      ORDER BY createdAt
    `, [id])

    return todos
  }

  createTodo = async (data) => {
    const queryText = `
        INSERT INTO todos(${Object.keys(data).join(', ')}) 
        VALUES($1, $2, $3) RETURNING todo_id`
    const result = await this.requestToDB(queryText, Object.values(data))

    return result[0].todo_id
  }

  changeTodo = async (data, id) => {
    const values = Object.values(data)
    const updates = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ')
    const updateQuery = `
          UPDATE todos 
          SET ${updates}
          WHERE todo_id = $${values.length + 1}
        `
    await this.requestToDB(updateQuery, [...values, id])
  }

  removeTodo = async (id) => {
    await this.requestToDB(`DELETE FROM todos WHERE todo_id = $1`, [id])
  }

  signUp = async (data) => {
    const queryText = `
        INSERT INTO users(${Object.keys(data).join(', ')}) 
        VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`
    const result = await this.requestToDB(queryText, Object.values(data))
    const user_id = result[0].user_id

    return user_id
  }

  storeRefreshToken = async (token, user_id) => {
    const queryText = 'INSERT INTO refresh_tokens(user_id, token) VALUES($1, $2)'
    await this.requestToDB(queryText, [user_id, token])
  }

  verifyRefreshToken = async (token) => {
    const queryText = 'SELECT * FROM refresh_tokens WHERE token = $1'
    const tokens = await this.requestToDB(queryText, [token])

    return tokens.length
  }

  removeRefreshToken = async (token) => {
    const queryText = 'DELETE FROM refresh_tokens WHERE token = $1'
    await this.requestToDB(queryText, [token])
  }
}

module.exports = new DataBase()