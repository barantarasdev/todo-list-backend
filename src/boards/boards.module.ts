import { Module } from '@nestjs/common'
import { BoardsController } from './boards.controller'
import { BoardsService } from './boards.service'
import { DatabaseService } from 'src/database/database.service'

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, DatabaseService],
})
export class BoardsModule {}
