import { ValidateRegExpT } from 'src/types/app.types'

export const SALT_OR_ROUNDS: number = 10

export const NEW_ORDER_STEP: number = 10.3

export const EXPIRES_IN_ACCESS_TOKEN: string = '15m'

export const EXPIRES_IN_REFRESH_TOKEN: string = '7d'

export const VALIDATES_REGEXP: ValidateRegExpT = {
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,15}$/,
  PHONE: /^\+?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  SITE: /^(https?:\/\/)?(?!www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
}
