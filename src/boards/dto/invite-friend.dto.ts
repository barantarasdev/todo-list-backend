import { ApiProperty } from '@nestjs/swagger'

export class InviteFriendDto {
  @ApiProperty({
    example: 'friendEmail@gmail.com',
    description: 'Friend email',
  })
  friendEmail: string
}
