import { MenusModule } from '@/menus/menus.module';
import { OrdersModule } from '@/orders/orders.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypegooseModule } from 'nest-typegoose';
import { CategoriesModule } from './categories/categories.module';
import { configuration } from './config';
import { TypegooseConfigService } from './config/typegoose.config.service';
import { HealthModule } from './health/health.module';
import { SessionModule } from './session/session.module';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [
    HealthModule,
    CategoriesModule,
    MenusModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypegooseModule.forRootAsync({
      useClass: TypegooseConfigService,
    }),
    OrdersModule,
    SessionModule,
    TablesModule,
  ],
})
export class AppModule {}
