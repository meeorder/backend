import { MenuSchema } from '@/schema/menus.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Prop, Ref, modelOptions } from '@typegoose/typegoose';
import { Types } from 'mongoose';
@modelOptions({
  schemaOptions: {
    collection: 'categories',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  },
})
export class CategorySchema {
  @Prop({ auto: true })
  @ApiProperty({ type: String, description: 'Category ID' })
  _id: Types.ObjectId;

  @Prop({ required: true })
  @ApiProperty({ type: String, description: 'Category title', required: true })
  title: string;

  @Prop({ default: [], ref: () => MenuSchema })
  @ApiProperty({ type: String, description: 'List of Menu', isArray: true })
  menus: Ref<MenuSchema>[];

  @Prop({ default: null })
  @ApiProperty({
    type: Number,
    description: 'Category rank',
    nullable: true,
  })
  rank: number;

  @ApiProperty({ type: Date })
  created_at: Date;
}
