import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { BoardsModule } from './boards/boards.module'
import { ColumnsModule } from './columns/columns.module'
import { TodosModule } from './todos/todos.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    AuthModule,
    BoardsModule,
    ColumnsModule,
    TodosModule,
  ],
})
export class AppModule {}
