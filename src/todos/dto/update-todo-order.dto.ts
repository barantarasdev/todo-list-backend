import { ApiProperty } from '@nestjs/swagger'

export class UpdateTodoOrderDto {
  @ApiProperty({ example: 'id', description: 'Column id' })
  columnId: string

  @ApiProperty({ example: 'id', description: 'Source todo id' })
  sourceTodoId: string

  @ApiProperty({ example: 'id', description: 'Destination todo id' })
  destinationTodoId: string
}
