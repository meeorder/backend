import { AddonsController } from '@/addons/addons.controller';
import { AddonSchema } from '@/schema/addons.schema';
import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nest-typegoose';
import { AddonsService } from './addons.service';

@Module({
  imports: [TypegooseModule.forFeature([AddonSchema])],
  providers: [AddonsService],
  controllers: [AddonsController],
})
export class AddonsModule {}
