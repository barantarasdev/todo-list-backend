import { Module } from '@nestjs/common'
import { ColumnsController } from './columns.controller'
import { ColumnsService } from './columns.service'
import { DatabaseService } from 'src/database/database.service'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, DatabaseService],
  imports: [GatewayModule],
})
export class ColumnsModule {}
