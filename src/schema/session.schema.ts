import { CouponSchema } from '@/schema/coupons.schema';
import { TablesSchema } from '@/schema/tables.schema';
import { UserSchema } from '@/schema/users.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Ref, modelOptions } from '@typegoose/typegoose';
import { Types } from 'mongoose';

@modelOptions({
  schemaOptions: {
    collection: 'sessions',
  },
})
export class SessionSchema {
  @Prop({ auto: true })
  @ApiProperty({ type: String, description: 'Session ID' })
  _id: Types.ObjectId;

  @Prop({ default: new Date() })
  @ApiProperty({ type: Date, description: 'Session creation date' })
  created_at: Date;

  @Prop({ default: null })
  @ApiProperty({
    type: Date,
    description: 'Session finish date',
    nullable: true,
  })
  finished_at: Date;

  @Prop({ default: null, ref: () => UserSchema })
  @ApiProperty({
    type: UserSchema,
    description: 'User ID',
    nullable: true,
  })
  user: Ref<UserSchema>;

  @Prop({ default: 0 })
  @ApiProperty({ description: 'User point' })
  point: number;

  @Prop({ default: null, ref: () => CouponSchema })
  @ApiProperty({
    type: CouponSchema,
    nullable: true,
    description: 'Coupon ID',
  })
  coupon: Ref<CouponSchema>;

  @Prop({ required: true, ref: () => TablesSchema })
  @ApiProperty({ type: TablesSchema, description: 'Table ID' })
  table: Ref<TablesSchema>;

  @Prop({ default: null })
  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Session deletion date',
  })
  deleted_at: Date;
}
