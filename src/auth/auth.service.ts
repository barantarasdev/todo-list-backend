import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from 'src/database/database.service'
import { CreateUserDto } from './dto/auth-create-user.dto'
import {
  EXPIRES_IN_ACCESS_TOKEN,
  EXPIRES_IN_REFRESH_TOKEN,
  SALT_OR_ROUNDS,
} from 'src/constants/app.constants'
import { LoginUserDto } from './dto/auth-login-user.dto'
import { GenerateTokensR, SignInR, SignUpR } from './auth.types'
import { LogoutUserDto } from './dto/auth-logout-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(
    userId: string,
    userEmail: string,
  ): Promise<GenerateTokensR> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email: userEmail,
      },
      {
        secret: process.env.ACCESS_SECRET_KEY,
        expiresIn: EXPIRES_IN_ACCESS_TOKEN,
      },
    )
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email: userEmail,
      },
      {
        secret: process.env.REFRESH_SECRET_KEY,
        expiresIn: EXPIRES_IN_REFRESH_TOKEN,
      },
    )

    return { accessToken, refreshToken }
  }

  async createUser(dto: CreateUserDto): Promise<SignUpR> {
    const isUser = await this.databaseService.getUserDB(dto.userEmail)

    if (isUser) {
      throw new BadRequestException()
    }

    const hashedPassword: string = await bcrypt.hash(
      dto.userPassword,
      SALT_OR_ROUNDS,
    )
    const user = {
      user_age: dto.userAge,
      user_email: dto.userEmail,
      user_gender: dto.userGender,
      user_name: dto.userName,
      user_phone: dto.userPhone,
      user_password: hashedPassword,
      user_site: dto.userSite,
      socket_id: '',
    }
    const { user_id: userId, user_email } =
      await this.databaseService.createUserDB(user)
    const tokens = await this.generateTokens(userId, user_email)
    await this.databaseService.createRefreshTokenDB(userId, tokens.refreshToken)

    return tokens
  }

  async loginUser(dto: LoginUserDto): Promise<SignInR> {
    const user = await this.databaseService.getUserDB(dto.userEmail)

    if (!user) {
      throw new UnauthorizedException()
    }

    const isMatch = await bcrypt.compare(dto.userPassword, user.user_password)

    if (!isMatch) {
      throw new UnauthorizedException()
    }

    const { user_id: userId, user_name: userName, user_email } = user
    const tokens = await this.generateTokens(userId, user_email)
    await this.databaseService.createRefreshTokenDB(userId, tokens.refreshToken)

    return { userName, ...tokens }
  }

  async logOut(dto: LogoutUserDto): Promise<void> {
    await this.databaseService.deleteRefreshTokenDB(dto.refreshToken)
  }

  async updateRefreshToken(
    currentRefreshToken: string,
  ): Promise<GenerateTokensR> {
    const refreshToken =
      await this.databaseService.getRefreshTokenDB(currentRefreshToken)

    if (!refreshToken) {
      throw new ForbiddenException()
    }

    const { user_email, user_id } = await this.databaseService.getUserByIdDB(
      refreshToken.user_id,
    )
    const tokens = await this.generateTokens(user_id, user_email)
    await this.databaseService.updateRefreshTokenDB(
      refreshToken.refresh_token,
      tokens.refreshToken,
    )

    return tokens
  }
}
