import { AddonsModule } from '@/addons/addons.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypegooseModule } from 'nest-typegoose';
import { CategoriesModule } from './categories/categories.module';
import { configuration } from './config';
import { TypegooseConfigService } from './config/typegoose.config.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    CategoriesModule,
    AddonsModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypegooseModule.forRootAsync({
      useClass: TypegooseConfigService,
    }),
  ],
})
export class AppModule {}
