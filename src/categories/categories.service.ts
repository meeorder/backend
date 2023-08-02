import { CategorySchema } from '@/schema/categories.schema';
import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { Types, mongo } from 'mongoose';
import { InjectModel } from 'nest-typegoose';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategorySchema)
    private readonly categoryModel: ReturnModelType<typeof CategorySchema>,
  ) {}

  async createCategory(title: string, rank: number) {
    return await this.categoryModel.create({
      title,
      rank,
    });
  }

  async getAllCategories() {
    const doc = await this.categoryModel.find().exec();
    return doc;
  }

  async getCategoryById(id: string) {
    const doc = await this.categoryModel
      .findById(new Types.ObjectId(id))
      .exec();
    return doc;
  }

  async updateCategory(id: string, updateCategory: CreateCategoryDto) {
    const doc = await this.categoryModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateCategory, { new: true })
      .exec();
    return doc;
  }

  deleteCategory(id: string): Promise<mongo.DeleteResult> {
    return this.categoryModel.deleteOne({ _id: id }).exec();
  }
}
