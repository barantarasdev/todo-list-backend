import { Injectable, OnModuleInit } from '@nestjs/common'
import {
  PrismaClient,
  boards,
  columns,
  friendship,
  refresh_tokens,
  todos,
  users,
} from '@prisma/client'
import { GetBoardsR, GetColumnsR } from 'src/types/app.types'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }

  async getMaxOrderColumns(board_id: string): Promise<number> {
    const result = await this.columns.aggregate({
      where: {
        board_id,
      },
      _max: {
        column_order: true,
      },
    })

    return Number(result._max.column_order) || 1.0
  }

  async getMaxOrderTodos(column_id: string): Promise<number> {
    const result = await this.todos.aggregate({
      where: {
        column_id,
      },
      _max: {
        todo_order: true,
      },
    })

    return Number(result._max.todo_order) || 1.0
  }

  async createUserDB(data: Omit<users, 'user_id'>): Promise<users> {
    return await this.users.create({ data })
  }

  async getUserDB(user_email: string): Promise<users> {
    return await this.users.findUnique({
      where: {
        user_email,
      },
    })
  }

  async getUserByIdDB(user_id: string): Promise<users> {
    return await this.users.findUnique({
      where: {
        user_id,
      },
    })
  }

  async updateSocketId(user_id: string, socket_id: string): Promise<void> {
    await this.users.update({
      where: { user_id },
      data: { socket_id },
    })
  }

  async getBoardDB(board_id: string): Promise<boards> {
    return await this.boards.findUnique({
      where: {
        board_id,
      },
    })
  }

  async getBoardsDB(user_id: string): Promise<GetBoardsR[]> {
    const boards = await this.boards.findMany({
      where: {
        OR: [
          { user_id },
          {
            friendship: {
              some: {
                friend_id: user_id,
              },
            },
          },
        ],
      },
    })

    return boards.map(({ board_id, board_name }) => ({
      boardId: board_id,
      boardName: board_name,
    }))
  }

  async getAllowsSocketsIds(
    user_id: string,
    board_id: string,
  ): Promise<string[]> {
    const friendships = await this.friendship.findMany({
      where: { board_id },
      select: { user_id: true, friend_id: true },
    })

    const allUserIds = new Set(
      friendships.flatMap(({ user_id, friend_id }) => [user_id, friend_id]),
    )

    const users = await this.users.findMany({
      where: { user_id: { in: Array.from(allUserIds) } },
      select: { socket_id: true, user_id: true },
    })

    return users
      .filter((user) => user.user_id !== user_id)
      .map(({ socket_id }) => socket_id)
  }

  async createBoardDB(data: Omit<boards, 'board_id'>): Promise<boards> {
    return await this.boards.create({ data })
  }

  async getColumnDB(column_id: string): Promise<columns> {
    return await this.columns.findUnique({ where: { column_id } })
  }

  async getColumnsDB(board_id: string): Promise<GetColumnsR[]> {
    const columns = await this.columns.findMany({
      where: {
        board_id,
      },
      orderBy: {
        column_order: 'asc',
      },
      include: {
        todos: {
          orderBy: {
            todo_order: 'asc',
          },
        },
      },
    })

    return columns.map(({ column_id, column_name, board_id, todos }) => ({
      columnId: column_id,
      columnName: column_name,
      boardId: board_id,
      todos: todos.map(({ todo_id, todo_value, todo_completed }) => ({
        todoId: todo_id,
        todoValue: todo_value,
        todoCompleted: todo_completed,
      })),
    }))
  }

  async createColumnDB(
    data: Omit<columns, 'column_id' | 'column_order'>,
  ): Promise<columns> {
    return await this.columns.create({
      data,
    })
  }

  async updateColumnDB(column_id: string, data: unknown): Promise<void> {
    await this.columns.update({
      where: { column_id },
      data,
    })
  }

  async getTodoDB(todo_id: string): Promise<todos> {
    return this.todos.findUnique({
      where: {
        todo_id,
      },
    })
  }

  async createTodoDB(
    data: Omit<todos, 'todo_id' | 'todo_order'>,
  ): Promise<todos> {
    return await this.todos.create({ data })
  }

  async updateTodoDB(todo_id: string, data: unknown): Promise<todos> {
    return await this.todos.update({
      where: {
        todo_id,
      },
      data,
    })
  }

  async deleteTodoDB(todo_id: string): Promise<todos> {
    return await this.todos.delete({ where: { todo_id } })
  }

  async getFriendshipDB(
    friend_id: string,
    board_id: string,
  ): Promise<friendship> {
    return await this.friendship.findFirst({
      where: {
        friend_id,
        board_id,
      },
    })
  }

  async createFriendshipDB(
    data: Omit<friendship, 'friendship_id'>,
  ): Promise<void> {
    await this.friendship.create({
      data,
    })
  }

  async createRefreshTokenDB(
    user_id: string,
    refresh_token: string,
  ): Promise<void> {
    await this.refresh_tokens.create({
      data: {
        user_id,
        refresh_token,
      },
    })
  }

  async deleteRefreshTokenDB(refresh_token: string): Promise<void> {
    await this.refresh_tokens.delete({
      where: {
        refresh_token,
      },
    })
  }

  async getRefreshTokenDB(refresh_token: string): Promise<refresh_tokens> {
    return await this.refresh_tokens.findUnique({
      where: {
        refresh_token,
      },
    })
  }

  async updateRefreshTokenDB(
    oldRefresh_token: string,
    refresh_token: string,
  ): Promise<void> {
    await this.refresh_tokens.update({
      where: {
        refresh_token: oldRefresh_token,
      },
      data: {
        refresh_token,
      },
    })
  }
}
