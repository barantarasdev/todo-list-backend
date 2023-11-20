import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateColumnDto } from './dto/create-column.dto'
import { getNewOrder, getTime } from 'src/helpers/app.helpers'
import { UpdateColumnOrderDto } from './dto/update-column-order.dto'
import { GetColumnsR } from 'src/types/app.types'

@Injectable()
export class ColumnsService {
  constructor(private databaseService: DatabaseService) {}

  async getColumns(id: string): Promise<GetColumnsR[]> {
    return await this.databaseService.getColumnsDB(id)
  }

  async createColumn(
    board_id: string,
    dto: CreateColumnDto,
  ): Promise<{ columnId: string }> {
    const max = await this.databaseService.getMaxOrderColumns(board_id)
    const time = getTime()
    const order = String(max) + time

    const newColumn = {
      column_name: dto.columnName,
      board_id,
      column_order: Number(order),
    }
    const column = await this.databaseService.createColumnDB(newColumn)

    return { columnId: column.column_id }
  }

  async updateColumnOrder(
    column_id: string,
    dto: UpdateColumnOrderDto,
  ): Promise<void> {
    let start: number | null = null
    let finish: number | null = null

    if (dto.sourceColumnId) {
      start = Number(
        (await this.databaseService.getColumnDB(dto.sourceColumnId))
          .column_order,
      )
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
  }
}
