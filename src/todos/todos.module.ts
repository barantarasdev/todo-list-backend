import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'

@Module({
  controllers: [TodosController],
  providers: [TodosService, DatabaseService],
})
export class TodosModule {}
