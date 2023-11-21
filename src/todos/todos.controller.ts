import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AccessTokenGuard } from 'src/common/guards/accessToken.guards'
import { BoardAccessGuard } from 'src/common/guards/boards-access.guards'
import { TodosService } from './todos.service'
import { CreateTodoDto } from './dto/create-todo.dto'
import { UpdateTodoDto } from './dto/update-todo.dto'
import { UpdateTodoOrderDto } from './dto/update-todo-order.dto'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Todos')
@UseGuards(AccessTokenGuard, BoardAccessGuard)
@Controller('/boards/:boardId/columns/:columnId')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @ApiOperation({ summary: 'Create todo' })
  @ApiResponse({ status: 201, type: 'todo_id' })
  @Post('/todos')
  createTodo(
    @Body() dto: CreateTodoDto,
    @Param('columnId') columnId: string,
  ): Promise<{ todoId: string }> {
    return this.todosService.createTodo(columnId, dto)
  }

  @ApiOperation({ summary: 'Update todo order' })
  @ApiResponse({ status: 200 })
  @Post('/todos/:todoId')
  updateTodoOrder(
    @Body() dto: UpdateTodoOrderDto,
    @Param('todoId') todoId: string,
  ): void {
    this.todosService.updateTodoOrder(todoId, dto)
  }

  @ApiOperation({ summary: 'Update todo' })
  @ApiResponse({ status: 200 })
  @Patch('/todos/:todoId')
  updateTodo(
    @Body() dto: UpdateTodoDto,
    @Param('todoId') todoId: string,
  ): void {
    this.todosService.updateTodo(todoId, dto)
  }

  @ApiOperation({ summary: 'Delete todo' })
  @ApiResponse({ status: 200 })
  @Delete('/todos/:todoId')
  deleteTodo(@Param('todoId') todoId: string): void {
    this.todosService.deleteTodo(todoId)
  }
}
