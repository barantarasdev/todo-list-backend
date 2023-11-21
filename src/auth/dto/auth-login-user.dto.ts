import { ApiProperty } from '@nestjs/swagger'

export class LoginUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  userEmail: string

  @ApiProperty({ example: '123aaA/', description: 'User password' })
  userPassword: string
}
