import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateColumnDto } from './dto/create-column.dto'
import { getNewOrder, getTime } from 'src/helpers/app.helpers'
import { UpdateColumnOrderDto } from './dto/update-column-order.dto'
import { GetColumnsR } from 'src/types/app.types'
import { GatewayService } from 'src/gateway/gateway.service'

@Injectable()
export class ColumnsService {
  constructor(
    private databaseService: DatabaseService,
    private gatewayService: GatewayService,
  ) {}

  async getColumns(id: string): Promise<GetColumnsR[]> {
    return await this.databaseService.getColumnsDB(id)
  }

  async createColumn(
    user_id: string,
    board_id: string,
    dto: CreateColumnDto,
  ): Promise<{ columnId: string }> {
    const max = await this.databaseService.getMaxOrderColumns(board_id)
    const time = getTime()
    const order = max + time

    const newColumn = {
      column_name: dto.columnName,
      board_id,
      column_order: order,
    }
    const column = await this.databaseService.createColumnDB(newColumn)
    this.gatewayService.sendNewColumns(user_id, column.board_id)

    return { columnId: column.column_id }
  }

  async updateColumnOrder(
    user_id: string,
    column_id: string,
    dto: UpdateColumnOrderDto,
  ): Promise<void> {
    let start: number | null = null
    let finish: number | null = null
    let boardId: string

    if (dto.sourceColumnId) {
      const startColumn = await this.databaseService.getColumnDB(
        dto.sourceColumnId,
      )

      boardId = startColumn.board_id
      start = Number(startColumn.column_order)
    }

    if (dto.destinationColumnId) {
      finish = Number(
        (await this.databaseService.getColumnDB(dto.destinationColumnId))
          .column_order,
      )
    }

    const newOrder = getNewOrder(start, finish)

    await this.databaseService.updateColumnDB(column_id, {
      column_order: Number(newOrder),
    })
    this.gatewayService.sendNewColumns(user_id, boardId)
  }
}
