import { AddonSchema } from '@/schema/addons.schema';
import { CategorySchema } from '@/schema/categories.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
export class GetMenuByIdResponseDto {
  @ApiProperty({ type: String, description: 'Menu ID' })
  _id: Types.ObjectId;

  @ApiProperty({ type: String, nullable: true })
  image: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description: string;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty({ type: () => CategorySchema })
  category: Ref<CategorySchema>;

  @ApiProperty({ type: () => AddonSchema, isArray: true })
  addons: Ref<AddonSchema>[];

  @ApiProperty({ type: Date })
  published_at: Date;

  @ApiProperty({ type: Date, nullable: true })
  deleted_at: Date;
}
