import { AddonsService } from '@/addons/addons.service';
import { CouponsService } from '@/coupons/coupons.service';
import { MenusService } from '@/menus/menus.service';
import { OrdersResponseDto } from '@/orders/dto/orders.response.dto';
import { OrderStatus } from '@/orders/enums/orders.status';
import { OrdersService } from '@/orders/orders.service';
import { AddonSchema } from '@/schema/addons.schema';
import { CouponSchema } from '@/schema/coupons.schema';
import { MenuSchema } from '@/schema/menus.schema';
import { SessionSchema } from '@/schema/session.schema';
import { UserSchema } from '@/schema/users.schema';
import { CouponDto } from '@/session/dto/getcoupon.dto';
import { SessionUserUpdateDto } from '@/session/dto/update-sessionUser.dto';
import { UpdateSessionCouponDto } from '@/session/dto/updatecoupon.dto';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nest-typegoose';
import { OrdersListDto } from './dto/listorders.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(SessionSchema)
    private readonly sessionModel: ReturnModelType<typeof SessionSchema>,
    @InjectModel(UserSchema)
    private readonly userModel: ReturnModelType<typeof UserSchema>,
    @InjectModel(CouponSchema)
    private readonly couponModel: ReturnModelType<typeof CouponSchema>,
    private readonly couponsService: CouponsService,
    private readonly menusService: MenusService,
    private readonly addonsService: AddonsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async createSession(table: Types.ObjectId) {
    const session = await this.sessionModel.create({
      table,
    });

    return session;
  }

  async finishSession(id: Types.ObjectId) {
    if (
      !(await this.ordersService.getOrdersBySession(id)).every(
        ({ status }) => status === OrderStatus.Done,
      )
    ) {
      throw new HttpException(
        'Session has orders that are not finished',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.sessionModel
      .updateOne(
        { _id: id, deleted_at: null },
        {
          finished_at: new Date(),
        },
      )
      .orFail()
      .exec();

    const session = await this.sessionModel.findById({ _id: id });
    await this.userModel.updateOne(
      { _id: session.user, deleted_at: null },
      { point: session.point },
    );

    return result;
  }

  async getSessionByTable(
    table: Types.ObjectId,
  ): Promise<DocumentType<SessionSchema>> {
    const session = await this.sessionModel
      .findOne({
        table,
        finished_at: null,
        deleted_at: null,
      })
      .populate('coupon table user')
      .exec();

    return session;
  }

  async getSessionById(
    id: Types.ObjectId,
  ): Promise<DocumentType<SessionSchema>> {
    return await this.sessionModel
      .findOne({
        _id: id,
        deleted_at: null,
      })
      .populate('coupon table user')
      .exec();
  }

  async getSessions(finished = false): Promise<DocumentType<SessionSchema>[]> {
    const sessions = await this.sessionModel
      .find({
        finished_at: finished ? { $ne: null } : null,
        deleted_at: null,
      })
      .populate('coupon table user')
      .exec();

    return sessions;
  }

  deleteSession(id: Types.ObjectId) {
    return this.sessionModel
      .updateOne({ _id: id, deleted_at: null }, { deleted_at: new Date() })
      .orFail()
      .exec();
  }

  async validateTableHasSession(table: Types.ObjectId) {
    const doc = await this.getSessionByTable(table);
    if (doc) {
      throw new ConflictException(`Table ${table} has session ${doc._id}`);
    }
  }

  async findTotalPrice(id: Types.ObjectId): Promise<number> {
    const res = await this.sessionModel
      .aggregate([
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'session',
            as: 'orders',
          },
        },
        {
          $project: {
            _id: 1,
            table: 1,
            orders: 1,
          },
        },
        {
          $lookup: {
            from: 'menus',
            localField: 'orders.menu',
            foreignField: '_id',
            as: 'menu',
          },
        },
        {
          $lookup: {
            from: 'addons',
            localField: 'orders.addons',
            foreignField: '_id',
            as: 'menu_addons',
          },
        },
        {
          $project: {
            _id: 1,
            menu: 1,
            menu_addons: 1,
          },
        },
        {
          $project: {
            menu_total: {
              $sum: '$menu.price',
            },
            addons_total: {
              $sum: '$menu_addons.price',
            },
          },
        },
        {
          $project: {
            totalprice: {
              $add: ['$menu_total', '$addons_total'],
            },
          },
        },
        {
          $match: {
            _id: id,
          },
        },
      ])
      .exec();
    return res[0].totalprice;
  }

  async listOrdersBySession(id: Types.ObjectId): Promise<OrdersListDto> {
    const res = new OrdersListDto();
    const orders = <OrdersResponseDto[]>(
      await this.ordersService.getOrdersBySession(id)
    );
    // find total price
    res.total_price = orders
      .map(({ menu, addons }) => {
        const addonPrice = addons?.reduce(
          (prev, current) => prev + (<AddonSchema>current).price,
          0,
        );

        return (
          (<MenuSchema>menu).price + (Number.isNaN(addonPrice) ? 0 : addonPrice)
        );
      })
      .reduce((prev, current) => prev + current, 0);
    // find total disount price
    const session = await this.getSessionById(id);
    const coupon = await this.couponModel.findById(session.coupon).exec();
    res.discount_price = coupon ? coupon.discount : 0;
    res.net_price = res.total_price - res.discount_price;
    res.table = session.table._id;
    res.orders = orders;
    return res;
  }

  async updateSessionUser(id: Types.ObjectId, userbody: SessionUserUpdateDto) {
    const new_user = userbody.user;
    const new_point = (await this.userModel.findById(new_user)).point;
    await this.sessionModel
      .updateOne({ _id: id }, { user: new_user, point: new_point })
      .orFail()
      .exec();
  }

  async getAllCoupon(id: Types.ObjectId): Promise<CouponDto[]> {
    const orders = await this.ordersService.getOrdersBySession(id);
    const session = await this.getSessionById(id);
    const menu_arr = orders.map((order) => order.menu);
    const coupon_arr = await this.couponModel.find({ activated: true }).exec();

    return coupon_arr.map(
      (coupon) =>
        new CouponDto(
          coupon.toObject(),
          this.isRedeemableCoupon(session, coupon, menu_arr),
        ),
    );
  }

  isRedeemableCoupon(
    session: Pick<SessionSchema, 'point'>,
    coupon: Pick<CouponSchema, 'required_point' | 'required_menus'>,
    menus: Pick<MenuSchema, '_id'>[],
  ) {
    const menus_ = <Types.ObjectId[]>coupon.required_menus;

    if (coupon.required_point > session.point) {
      return false;
    }

    if (menus_.length === 0) {
      return true;
    }

    for (let k = 0; k < menus_.length; k++) {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i]._id.equals(menus_[k])) {
          return true;
        }
      }
    }

    return false;
  }

  async updateSessionCoupon(id: Types.ObjectId, body: UpdateSessionCouponDto) {
    const session = await this.getSessionById(id);

    const currentCouponId = session.coupon?._id;
    const newCouponId = body.coupon_id;

    if (currentCouponId?.equals(newCouponId)) {
      return;
    }

    if (currentCouponId) {
      await this.couponsService.refundCoupon(currentCouponId.toString());
    }

    if (newCouponId) {
      await this.couponsService.redeemCoupon(newCouponId.toString());
    }

    session.coupon = newCouponId;
    await session.save();

    return session;
  }
}
