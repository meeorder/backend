import { CreateOrderDto } from '@/orders/dto/order.create.dto';
import { OrderGetDto } from '@/orders/dto/order.get.dto';
import { OrderStatus } from '@/orders/enums/orders.status';
import { ParseMongoIdPipe } from '@/pipes/mongo-id.pipe';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';

@Controller({ path: 'orders', version: '1' })
@ApiTags('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Create order' })
  @ApiOperation({
    summary: 'Create order',
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => OrderGetDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get all orders',
  })
  @HttpCode(HttpStatus.OK)
  async getOrders() {
    return await this.ordersService.getOrders();
  }

  @Patch('/:id/preparing')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Set order status to preparing',
  })
  @ApiOperation({
    summary: 'Change order status to preparing',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async preparing(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    await this.ordersService.setStatus(
      new Types.ObjectId(id),
      OrderStatus.Preparing,
    );
  }

  @Patch('/:id/ready_to_serve')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Set order status to ready to serve',
  })
  @ApiOperation({
    summary: 'Change order status to ready to serve',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async readyToServe(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    await this.ordersService.setStatus(
      new Types.ObjectId(id),
      OrderStatus.ReadyToServe,
    );
  }

  @Patch('/:id/done')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Set order status to done',
  })
  @ApiOperation({
    summary: 'Change order status to done',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async done(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    await this.ordersService.setStatus(
      new Types.ObjectId(id),
      OrderStatus.Done,
    );
  }

  @Patch('/:id/cancel')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cancel order',
  })
  @ApiOperation({
    summary: 'Cancel order',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    await this.ordersService.cancel(new Types.ObjectId(id));
  }

  @Patch('/:id/cancel/addons')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cancel order with addons disable',
  })
  @ApiOperation({
    summary: 'Cancel order and disable addons',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelByAddons(
    @Param('id', new ParseMongoIdPipe()) id: Types.ObjectId,
  ) {
    await this.ordersService.cancelByAddons(new Types.ObjectId(id));
  }
}
