import { ApiProperty } from '@nestjs/swagger'

export class UpdateColumnOrderDto {
  @ApiProperty({ example: 'id', description: 'Source column id' })
  sourceColumnId: string

  @ApiProperty({ example: 'id', description: 'Destination column id' })
  destinationColumnId: string
}
