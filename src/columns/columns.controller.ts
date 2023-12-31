import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AccessTokenGuard } from 'src/common/guards/accessToken.guards'
import { CreateColumnDto } from './dto/create-column.dto'
import { ColumnsService } from './columns.service'
import { BoardAccessGuard } from 'src/common/guards/boards-access.guards'
import { UpdateColumnOrderDto } from './dto/update-column-order.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetColumnsR } from 'src/types/app.types'
import { Request } from 'express'

@ApiTags('Columns')
@UseGuards(AccessTokenGuard, BoardAccessGuard)
@Controller('/boards/:boardId')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @ApiOperation({ summary: 'Get all columns' })
  @ApiResponse({ status: 200, type: [GetColumnsR] })
  @Get('/columns')
  getColumns(@Param('boardId') boardId: string): Promise<GetColumnsR[]> {
    return this.columnsService.getColumns(boardId)
  }

  @ApiOperation({ summary: 'Create column' })
  @ApiResponse({ status: 201, type: 'column_id' })
  @Post('/columns')
  createColumn(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ): Promise<{ columnId: string }> {
    return this.columnsService.createColumn(req.user['sub'], boardId, dto)
  }

  @ApiOperation({ summary: 'Update column order' })
  @ApiResponse({ status: 201 })
  @HttpCode(HttpStatus.OK)
  @Post('/columns/:columnId')
  updateColumnOrder(
    @Req() req: Request,
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnOrderDto,
  ): void {
    this.columnsService.updateColumnOrder(req.user['sub'], columnId, dto)
  }
}
