import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { modelOptions } from '@typegoose/typegoose';
import { Types } from 'mongoose';

@modelOptions({
  schemaOptions: { collection: 'ingredients' },
})
export class IngredientSchema {
  @Prop({ auto: true })
  @ApiProperty({ type: String, description: 'Ingredient ID' })
  _id: Types.ObjectId;

  @Prop({ required: true })
  @ApiProperty({ type: String, description: 'Ingredient title' })
  title: string;

  @Prop({ default: true })
  @ApiProperty({ type: Boolean, description: 'Ingredient status' })
  available: boolean;
}
