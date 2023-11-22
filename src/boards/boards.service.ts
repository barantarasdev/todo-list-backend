import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { createBoardDto } from './dto/create-board.dto'
import { InviteFriendDto } from './dto/invite-friend.dto'
import { GetBoardsR } from 'src/types/app.types'
import { updateSocketIdDto } from './dto/update-socket-id.dto'

@Injectable()
export class BoardsService {
  constructor(private databaseService: DatabaseService) {}

  async getBoards(id: string): Promise<GetBoardsR[]> {
    return await this.databaseService.getBoardsDB(id)
  }

  async createBoard(
    user_id: string,
    dto: createBoardDto,
  ): Promise<{ boardId: string }> {
    const newBoard = {
      board_name: dto.boardName,
      user_id,
    }
    const board = await this.databaseService.createBoardDB(newBoard)

    return { boardId: board.board_id }
  }

  async updateSocketId(user_id: string, dto: updateSocketIdDto): Promise<void> {
    await this.databaseService.updateSocketId(user_id, dto.socketId)
  }

  async inviteFriend(
    board_id: string,
    user_id: string,
    dto: InviteFriendDto,
  ): Promise<void> {
    const user = await this.databaseService.getUserDB(dto.friendEmail)
    const currentUser = await this.databaseService.getUserByIdDB(user_id)

    if (!user) {
      throw new NotFoundException('Email not found!')
    }

    const isUser = await this.databaseService.getFriendshipDB(
      user.user_id,
      board_id,
    )

    if (isUser || currentUser.user_email === dto.friendEmail) {
      throw new BadRequestException('This email already exists!')
    }

    const friend = {
      user_id,
      friend_id: user.user_id,
      board_id,
    }

    await this.databaseService.createFriendshipDB(friend)
  }
}
