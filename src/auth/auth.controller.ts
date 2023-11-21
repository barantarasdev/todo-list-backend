import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from './dto/auth-create-user.dto'
import { LoginUserDto } from './dto/auth-login-user.dto'
import { GenerateTokensR, SignInR, SignUpR } from './auth.types'
import { LogoutUserDto } from './dto/auth-logout-user.dto'
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guards'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: SignUpR })
  @UsePipes(new ValidationPipe())
  @Post('/signUp')
  signUp(@Body() dto: CreateUserDto): Promise<SignUpR> {
    return this.authService.createUser(dto)
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, type: SignInR })
  @HttpCode(HttpStatus.OK)
  @Post('/signIn')
  signIn(@Body() dto: LoginUserDto): Promise<SignInR> {
    return this.authService.loginUser(dto)
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200 })
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logOut(@Body() dto: LogoutUserDto): void {
    this.authService.logOut(dto)
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, type: GenerateTokensR })
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/refresh')
  refresh(@Req() req: Request): Promise<GenerateTokensR> {
    return this.authService.updateRefreshToken(req.user['refreshToken'])
  }
}
