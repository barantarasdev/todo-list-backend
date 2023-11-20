import { ApiProperty } from '@nestjs/swagger'

export class UpdateTodoDto {
  @ApiProperty({ example: 'Value', description: 'Todo value' })
  todoValue?: string

  @ApiProperty({ example: 'false', description: 'Todo completed' })
  todoCompleted?: boolean
}
