import { CreateOrderDto } from '@/orders/dto/order.create.dto';
import { OrdersSchema } from '@/schema/order.schema';
import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nest-typegoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(OrdersSchema)
    private readonly orderModel: ReturnModelType<typeof OrdersSchema>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const insertObject = createOrderDto.orders.map((food_element) => {
      const element = new OrdersSchema();
      element.session = new Types.ObjectId(createOrderDto.session);
      element.menu = new Types.ObjectId(food_element.menu);
      element.addons = food_element.addons?.map(
        (addons_element) => new Types.ObjectId(addons_element),
      );
      element.additional_info = food_element.additional_info;
      return element;
    });
    await this.orderModel.insertMany(insertObject);
  }

  async findBySessionId(id: Types.ObjectId) {
    return await this.orderModel.find({ session: id }).exec();
  }
}
