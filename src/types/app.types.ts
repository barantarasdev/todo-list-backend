import { ApiProperty } from '@nestjs/swagger'

export type ValidateRegExpT = Record<string, RegExp>

export class GetBoardsR {
  @ApiProperty({ example: '3242jfsd2342fdsfs', description: 'Board id' })
  boardId: string

  @ApiProperty({ example: 'Board name', description: 'Board name' })
  boardName: string
}

export class GetTodoT {
  @ApiProperty({ example: '3242jfsd2342fdsfs', description: 'Todo id' })
  todoId: string

  @ApiProperty({ example: 'Value', description: 'Todo value' })
  todoValue: string

  @ApiProperty({ example: 'false', description: 'Todo completed' })
  todoCompleted: boolean
}

export class GetColumnsR {
  @ApiProperty({ example: '3242jfsd2342fdsfs', description: 'Column id' })
  columnId: string

  @ApiProperty({ example: 'Name', description: 'Column name' })
  columnName: string

  @ApiProperty({ example: '3242jfsd2342fdsfs', description: 'Board id' })
  boardId: string

  @ApiProperty({ example: GetTodoT, description: 'Todos' })
  todos: GetTodoT[]
}
