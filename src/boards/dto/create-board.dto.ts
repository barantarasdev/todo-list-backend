import { ApiProperty } from '@nestjs/swagger'

export class createBoardDto {
  @ApiProperty({ example: 'Name', description: 'Board name' })
  boardName: string
}
