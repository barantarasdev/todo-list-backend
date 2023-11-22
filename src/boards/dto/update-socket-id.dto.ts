import { ApiProperty } from '@nestjs/swagger'

export class updateSocketIdDto {
  @ApiProperty({ example: '32ffd232', description: 'Socked id' })
  socketId: string
}
