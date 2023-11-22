import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  controllers: [TodosController],
  providers: [TodosService, DatabaseService],
  imports: [GatewayModule],
})
export class TodosModule {}
