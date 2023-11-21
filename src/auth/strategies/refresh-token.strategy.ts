import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_SECRET_KEY,
      passReqToCallback: true,
    })
  }

  async validate(req: Request, payload: unknown) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim()

    return { ...(payload as object), refreshToken }
  }
}
