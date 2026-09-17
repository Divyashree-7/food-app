import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to real-time gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string }
  ) {
    const room = `order_${data.orderId}`;
    client.join(room);
    this.logger.log(`Socket ${client.id} joined ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('driver_location_ping')
  handleDriverLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string; lat: number; lng: number; etaMinutes: number }
  ) {
    const room = `order_${data.orderId}`;
    // Broadcast live to customer and admin
    this.server.to(room).emit('driver_location_update', {
      lat: data.lat,
      lng: data.lng,
      etaMinutes: data.etaMinutes,
      timestamp: Date.now(),
    });
  }

  public notifyStatusChange(orderId: string, status: string, note?: string) {
    const room = `order_${orderId}`;
    this.server.to(room).emit('order_status_update', {
      orderId,
      status,
      note,
      timestamp: Date.now(),
    });
  }

  public notifyCatalogUpdate(storeId: string, productId: string, isAvailable: boolean, price: number) {
    this.server.emit('catalog_update', {
      storeId,
      productId,
      isAvailable,
      price,
      timestamp: Date.now(),
    });
  }
}
