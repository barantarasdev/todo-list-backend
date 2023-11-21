import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { getNewOrder, getTime } from 'src/helpers/app.helpers'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { UpdateTodoOrderDto } from './dto/update-todo-order.dto'

@Injectable()
export class TodosService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTodo(
    column_id: string,
    dto: CreateTodoDto,
  ): Promise<{ todoId: string }> {
    const max = await this.databaseService.getMaxOrderTodos(column_id)
    const time = getTime()
    const order = String(max) + time

    const newTodo = {
      todo_value: dto.todoValue,
      todo_completed: false,
      column_id,
      todo_order: Number(order),
    }
    const todo = await this.databaseService.createTodoDB(newTodo)

    return { todoId: todo.todo_id }
  }

  async updateTodoOrder(
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
  }

  async updateTodo(todoId: string, dto: UpdateTodoDto): Promise<void> {
    const updatedTodo = {
      todo_value: dto?.todoValue,
      todo_completed: dto?.todoCompleted,
    }

    await this.databaseService.updateTodoDB(todoId, updatedTodo)
  }

  async deleteTodo(todoId: string): Promise<void> {
    await this.databaseService.deleteTodoDB(todoId)
  }
}
