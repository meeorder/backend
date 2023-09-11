import { CreateIngredientDto } from '@/ingredients/dto/create.ingredient.dto';
import { UpdateIngredientDto } from '@/ingredients/dto/update.ingredient.dto';
import { IngredientsService } from '@/ingredients/ingredients.service';
import { IngredientSchema } from '@/schema/ingredients.schema';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller({ path: 'ingredients', version: '1' })
@ApiTags('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  // Create a ingredient
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ingredient created',
    type: () => IngredientSchema,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ingredient already exists',
  })
  @ApiOperation({
    summary: 'Create a ingredient',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createIngredientDto: CreateIngredientDto) {
    return await this.ingredientsService.createIngredient(createIngredientDto);
  }

  // Get all ingredients
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => IngredientSchema,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get all ingredients',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.ingredientsService.getAllIngredient();
  }

  // Get a ingredient by id
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => IngredientSchema,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found',
  })
  @ApiOperation({
    summary: 'Get a ingredient by id',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.ingredientsService.getIngredientById(id);
  }

  // Update a ingredient
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ingredient updated',
    type: () => IngredientSchema,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ingredient already exists',
  })
  @ApiOperation({
    summary: 'Update a ingredient by id',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateIngredient(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return await this.ingredientsService.updateIngredient(
      id,
      updateIngredientDto,
    );
  }

  // Delete a ingredient
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ingredient deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ingredient not found',
  })
  @ApiOperation({
    summary: 'Delete a ingredient by id',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.ingredientsService.deleteIngredient(id);
  }
}
