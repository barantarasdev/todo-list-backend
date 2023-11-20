import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { DatabaseService } from 'src/database/database.service'
import { JwtModule } from '@nestjs/jwt'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { AuthController } from './auth.controller'

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    DatabaseService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
