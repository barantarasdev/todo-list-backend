import { ApiProperty } from '@nestjs/swagger'

export class CreateTodoDto {
  @ApiProperty({ example: 'Value', description: 'Todo name' })
  todoValue: string
}
