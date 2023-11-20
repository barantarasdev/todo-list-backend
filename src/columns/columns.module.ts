import { Module } from '@nestjs/common'
import { ColumnsController } from './columns.controller'
import { ColumnsService } from './columns.service'
import { DatabaseService } from 'src/database/database.service'

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, DatabaseService],
})
export class ColumnsModule {}
