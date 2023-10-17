import { ReceiptService } from '@/receipt/receipt.service';
import { CategorySchema } from '@/schema/categories.schema';
import { CouponSchema } from '@/schema/coupons.schema';
import { MenuSchema } from '@/schema/menus.schema';
import { OrdersSchema } from '@/schema/order.schema';
import { ReceiptSchema } from '@/schema/receipt.schema';
import { SessionSchema } from '@/schema/session.schema';
import { SettingService } from '@/setting/setting.service';
import { Test } from '@nestjs/testing';
import { getModelForClass } from '@typegoose/typegoose';
import { getModelToken } from 'nest-typegoose';

jest.mock('@/setting/setting.service');

describe('ReceiptService', () => {
  class MockReceiptModel extends ReceiptSchema {
    save = jest.fn().mockResolvedValue(this);
  }
  let receiptService: ReceiptService;
  const receiptModel = MockReceiptModel;
  const sessionModel = getModelForClass(SessionSchema);
  const orderModel = getModelForClass(OrdersSchema);
  const menuModel = getModelForClass(MenuSchema);
  const couponModel = getModelForClass(CouponSchema);
  const categoryModel = getModelForClass(CategorySchema);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReceiptService,
        SettingService,
        {
          provide: getModelToken(ReceiptSchema.name),
          useValue: receiptModel,
        },
      ],
    }).compile();

    receiptService = module.get<ReceiptService>(ReceiptService);
  });

  it('should be defined', () => {
    expect(receiptService).toBeDefined();
  });

  describe('generateReceipt', () => {
    it('should return correct receipt', async () => {
      const MULTIPLIER = 100;
      const NUMBERS = Array.from({ length: 10 }, (_, k) => k * MULTIPLIER);
      const session = new sessionModel();
      const menus = Array.from({ length: 10 }, (_, k) => {
        const menu = new menuModel();
        menu.title = `menu ${k}`;
        menu.price = NUMBERS[k];
        menu.category = new categoryModel();
        return menu;
      });

      const orders = menus.map((menu) => {
        const order = new orderModel();
        order.menu = menu;
        return order;
      });

      const coupon = new couponModel();
      coupon.title = 'coupon';
      coupon.discount = 20;
      session.populate = jest.fn().mockResolvedValue({ orders, coupon });
      const result = await receiptService.generateReceipt(session);
      expect(result.total_price).toBe(NUMBERS.reduce((a, b) => a + b, 0));
      expect(result.discount_price).toBe(coupon.discount);
      expect(result.net_price).toBe(result.total_price - result.discount_price);
    });
  });
});
