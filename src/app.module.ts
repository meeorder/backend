import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './config/mongoose.config.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
  ],
})
export class AppModule {}
