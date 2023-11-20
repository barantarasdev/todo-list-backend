import { ApiProperty } from '@nestjs/swagger'

export class LogoutUserDto {
  @ApiProperty({
    example: 'fds032nfs923nfs9f23nfs92',
    description: 'Access token',
  })
  refreshToken: string
}
