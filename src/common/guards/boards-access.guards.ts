import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { sub } = request.user
    const { boardId } = request.params

    const board = await this.databaseService.getBoardDB(boardId)
    const friend = await this.databaseService.getFriendshipDB(sub, boardId)
    const isError =
      board.user_id !== sub && friend && board.user_id !== friend.user_id

    if (isError) {
      throw new UnauthorizedException()
    }

    return true
  }
}
