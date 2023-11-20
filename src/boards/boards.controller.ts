import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BoardsService } from './boards.service'
import { AccessTokenGuard } from 'src/common/guards/accessToken.guards'
import { createBoardDto } from './dto/create-board.dto'
import { InviteFriendDto } from './dto/invite-friend.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { GetBoardsR } from 'src/types/app.types'

@ApiTags('Boards')
@UseGuards(AccessTokenGuard)
@Controller('/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiOperation({ summary: 'Get all boards' })
  @ApiResponse({ status: 200, type: [GetBoardsR] })
  @Get()
  getBoards(@Req() req: Request): Promise<GetBoardsR[]> {
    return this.boardsService.getBoards(req.user['sub'])
  }

  @ApiOperation({ summary: 'Create board' })
  @ApiResponse({ status: 201, type: 'board_id' })
  @Post()
  createBoard(
    @Req() req: Request,
    @Body() dto: createBoardDto,
  ): Promise<{ boardId: string }> {
    return this.boardsService.createBoard(req.user['sub'], dto)
  }

  @ApiOperation({ summary: 'Invite friend' })
  @ApiResponse({ status: 200 })
  @Post('/:boardId/invite')
  async inviteFriend(
    @Param('boardId') boardId: string,
    @Req() req: Request,
    @Body() dto: InviteFriendDto,
  ): Promise<void> {
    await this.boardsService.inviteFriend(boardId, req.user['sub'], dto)
  }
}
