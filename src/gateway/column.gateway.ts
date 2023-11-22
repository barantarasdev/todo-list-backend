import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { GetColumnsR } from 'src/types/app.types'

@WebSocketGateway({ cors: true })
export class ColumnGateway {
  @WebSocketServer()
  server: Server

  onUpdate(data: { columns: GetColumnsR[] }, allowsUsers: string[]): void {
    this.server.sockets.sockets.forEach((socket) => {
      if (allowsUsers.includes(socket.id)) {
        socket.emit('columnsUpdated', data)
      }
    })
  }
}
