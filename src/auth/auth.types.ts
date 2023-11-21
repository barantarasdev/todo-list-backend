import { ApiProperty } from '@nestjs/swagger'

export class SignInR {
  @ApiProperty({
    example: 'User',
    description: 'User name',
  })
  userName: string

  @ApiProperty({
    example: 'fds032nfs923nfs9f23nfs92',
    description: 'Access token',
  })
  accessToken: string

  @ApiProperty({
    example: 'fds032nfs923nfs9f23nfs92',
    description: 'Access token',
  })
  refreshToken: string
}

export class SignUpR {
  @ApiProperty({
    example: 'fds032nfs923nfs9f23nfs92',
    description: 'Access token',
  })
  accessToken: string

  @ApiProperty({
    example: 'fs2klf93ji29fj2ifj9j2ifj32',
    description: 'Refresh token',
  })
  refreshToken: string
}

export class GenerateTokensR {
  @ApiProperty({
    example: 'fds032nfs923nfs9f23nfs92',
    description: 'Access token',
  })
  accessToken: string

  @ApiProperty({
    example: 'fs2klf93ji29fj2ifj9j2ifj32',
    description: 'Refresh token',
  })
  refreshToken: string
}
