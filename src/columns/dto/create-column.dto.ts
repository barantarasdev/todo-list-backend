import { ApiProperty } from '@nestjs/swagger'

export class CreateColumnDto {
  @ApiProperty({ example: 'Name', description: 'Column name' })
  columnName: string
}
