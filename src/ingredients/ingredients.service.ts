import { CreateIngredientDto } from '@/ingredients/dto/create.ingredient.dto';
import { UpdateIngredientDto } from '@/ingredients/dto/update.ingredient.dto';
import { IngredientSchema } from '@/schema/ingredients.schema';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { InjectModel } from 'nest-typegoose';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectModel(IngredientSchema)
    private ingredientModel: ReturnModelType<typeof IngredientSchema>,
  ) {}

  async createIngredient(ingredientInfo: CreateIngredientDto) {
    try {
      const createIng = await this.ingredientModel.create({
        title: ingredientInfo.title,
        available: ingredientInfo.available,
      });
      return createIng.toObject();
    } catch (err) {
      const duplicateErrorCode = 11000;
      if (err.code === duplicateErrorCode) {
        throw new BadRequestException({
          message: 'Title is already taken',
        });
      } else {
        throw err;
      }
    }
  }

  async getAllIngredient() {
    return await this.ingredientModel.find().exec();
  }

  async getIngredientById(id: string) {
    const doc = await this.ingredientModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Ingredient not found');
    }
    return doc;
  }

  async updateIngredient(id: string, ingredientInfo: UpdateIngredientDto) {
    try {
      const doc = await this.ingredientModel
        .findByIdAndUpdate(new Types.ObjectId(id), ingredientInfo, {
          new: true,
        })
        .exec();

      if (!doc) {
        throw new NotFoundException('Ingredient not found');
      }

      return doc;
    } catch (err) {
      const duplicateErrorCode = 11000;
      if (err.code === duplicateErrorCode) {
        throw new BadRequestException({
          message: 'Title is already taken',
        });
      } else {
        throw err;
      }
    }
  }

  async deleteIngredient(id: string) {
    const doc = await this.ingredientModel.findByIdAndRemove(id);
    if (!doc) {
      throw new NotFoundException('Ingredient not found');
    }
    return { message: 'Ingredient deleted' };
  }
}
