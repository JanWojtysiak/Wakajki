import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class ProjectsGateway {
  @WebSocketServer()
  server: Server;

  notifyClients() {
    this.server.emit('projectsUpdated');
  }
}
