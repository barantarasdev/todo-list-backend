const URL_TODOS_PATTERN = /^\/todos\/user\/.+$/
const URL_MANIPULATE_TODOS_PATTERN = /^\/todos\/.+$/

const ACCESS_TOKEN_EXPIRES = '15m'

const SALT_ROUNDS = 10

module.exports = {
  URL_TODOS_PATTERN,
  URL_MANIPULATE_TODOS_PATTERN,
  ACCESS_TOKEN_EXPIRES,
  SALT_ROUNDS
}