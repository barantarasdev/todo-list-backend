import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { ColumnGateway } from './column.gateway'

@Injectable()
export class GatewayService {
  constructor(
    private databaseService: DatabaseService,
    private columnGateway: ColumnGateway,
  ) {}

  async sendNewColumns(user_id: string, board_id: string): Promise<void> {
    const columns = await this.databaseService.getColumnsDB(board_id)
    const allowsUsers = await this.databaseService.getAllowsSocketsIds(
      user_id,
      board_id,
    )

    this.columnGateway.onUpdate({ columns }, allowsUsers)
  }
}
