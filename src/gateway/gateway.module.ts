import { Module } from '@nestjs/common'
import { ColumnGateway } from './column.gateway'
import { GatewayService } from './gateway.service'
import { DatabaseService } from 'src/database/database.service'

@Module({
  providers: [GatewayService, ColumnGateway, DatabaseService],
  exports: [GatewayService],
})
export class GatewayModule {}
