import { ParseMongoIdPipe } from '@/pipes/mongo-id.pipe';
import { SessionSchema } from '@/schema/session.schema';
import { CreateSessionDto } from '@/session/dto/create-session.dto';
import { CouponDto } from '@/session/dto/getcoupon.dto';
import { OrdersListDto } from '@/session/dto/listorders.dto';
import { SessionUserUpdateDto } from '@/session/dto/update-sessionUser.dto';
import { UpdateSessionCouponDto } from '@/session/dto/updatecoupon.dto';
import { SessionService } from '@/session/session.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongooseError, Types } from 'mongoose';

@Controller({ path: 'sessions', version: '1' })
@ApiTags('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiQuery({ name: 'finished', type: Boolean, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions list',
    type: () => SessionSchema,
    isArray: true,
  })
  @Get()
  getSessions(@Query('finished') finished?: boolean) {
    return this.sessionService.getSessions(finished);
  }

  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session',
    type: () => SessionSchema,
  })
  @Get(':id')
  async getSession(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    const doc = await this.sessionService.getSessionById(id);
    if (!doc) {
      throw new HttpException(`Session ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return doc;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session',
    type: () => SessionSchema,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No session found in the table',
  })
  @ApiParam({ name: 'id', type: String, description: 'Table ID' })
  @Get('table/:id')
  async getSessionByTable(
    @Param('id', new ParseMongoIdPipe()) id: Types.ObjectId,
  ) {
    const doc = await this.sessionService.getSessionByTable(id);
    if (!doc) {
      throw new HttpException(
        `No session found in the table ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return doc;
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session created',
    type: () => SessionSchema,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Body() dto: CreateSessionDto) {
    await this.sessionService.validateTableHasSession(dto.table);
    const doc = await this.sessionService.createSession(dto.table);
    return doc;
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session finished',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @Patch(':id/finish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async finishSession(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    try {
      await this.sessionService.finishSession(id);
    } catch (e) {
      if (e instanceof MongooseError) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      } else {
        throw e;
      }
    }
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Session deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    try {
      await this.sessionService.deleteSession(id);
    } catch (e) {
      if (e instanceof MongooseError) {
        throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
      } else {
        throw e;
      }
    }
  }

  @Get('/:id/orders')
  @ApiParam({ name: 'id', type: String, description: 'Session ID (ObjectId)' })
  @ApiResponse({
    type: () => OrdersListDto,
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  async getOrdersBySession(
    @Param('id', new ParseMongoIdPipe()) id: Types.ObjectId,
  ) {
    return await this.sessionService.listOrdersBySession(id);
  }

  @ApiResponse({
    description: 'Updated session user',
    type: () => SessionUserUpdateDto,
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/updateuser')
  async updateSessionUser(
    @Param('id', new ParseMongoIdPipe()) id: Types.ObjectId,
    @Body() doc: SessionUserUpdateDto,
  ) {
    return await this.sessionService.updateSessionUser(id, doc);
  }

  @ApiResponse({
    description: 'Get all useable coupon',
    type: () => CouponDto,
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id/coupons')
  async getCoupons(@Param('id', new ParseMongoIdPipe()) id: Types.ObjectId) {
    return await this.sessionService.getAllCoupon(id);
  }

  @ApiResponse({
    description: 'Update coupon in session',
    type: () => UpdateSessionCouponDto,
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/updatecoupon')
  async updateSessionCoupon(
    @Param('id', new ParseMongoIdPipe()) id: Types.ObjectId,
    @Body() doc: UpdateSessionCouponDto,
  ) {
    await this.sessionService.updateSessionCoupon(id, doc);
  }
}
