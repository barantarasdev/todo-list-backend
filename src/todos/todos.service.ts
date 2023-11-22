import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { getNewOrder, getTime } from 'src/helpers/app.helpers'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { UpdateTodoOrderDto } from './dto/update-todo-order.dto'
import { GatewayService } from 'src/gateway/gateway.service'

@Injectable()
export class TodosService {
  constructor(
    private readonly databaseService: DatabaseService,
    private gatewayService: GatewayService,
  ) {}

  async sendNewColumns(user_id: string, columnId: string): Promise<void> {
    const { board_id } = await this.databaseService.getColumnDB(columnId)
    this.gatewayService.sendNewColumns(user_id, board_id)
  }

  async createTodo(
    user_id: string,
    column_id: string,
    dto: CreateTodoDto,
  ): Promise<{ todoId: string }> {
    const max = await this.databaseService.getMaxOrderTodos(column_id)
    const time = getTime()
    const order = max + time

    const newTodo = {
      todo_value: dto.todoValue,
      todo_completed: false,
      column_id,
      todo_order: order,
    }
    const todo = await this.databaseService.createTodoDB(newTodo)
    this.sendNewColumns(user_id, column_id)

    return { todoId: todo.todo_id }
  }

  async updateTodoOrder(
    user_id: string,
    todo_id: string,
    dto: UpdateTodoOrderDto,
  ): Promise<void> {
    let start = null
    let finish = null

    if (dto.sourceTodoId) {
      start = Number(
        (await this.databaseService.getTodoDB(dto.sourceTodoId)).todo_order,
      )
    }

    if (dto.destinationTodoId) {
      finish = Number(
        (await this.databaseService.getTodoDB(dto.destinationTodoId))
          .todo_order,
      )
    }

    const newOrder = getNewOrder(start, finish)
    const updatedTodo = { todo_order: newOrder, column_id: dto.columnId }

    await this.databaseService.updateTodoDB(todo_id, updatedTodo)
    this.sendNewColumns(user_id, updatedTodo.column_id)
  }

  async updateTodo(
    user_id: string,
    todoId: string,
    dto: UpdateTodoDto,
  ): Promise<void> {
    const updatedTodo = {
      todo_value: dto?.todoValue,
      todo_completed: dto?.todoCompleted,
    }

    const todo = await this.databaseService.updateTodoDB(todoId, updatedTodo)
    this.sendNewColumns(user_id, todo.column_id)
  }

  async deleteTodo(user_id: string, todoId: string): Promise<void> {
    const todo = await this.databaseService.deleteTodoDB(todoId)
    this.sendNewColumns(user_id, todo.column_id)
  }
}
