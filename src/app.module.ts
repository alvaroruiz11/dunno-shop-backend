import { Module } from '@nestjs/common';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { FilesModule } from './files/files.module';
import { OrdersModule } from './orders/orders.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    PrismaModule,
    SeedModule,
    AuthModule,
    CategoriesModule,
    FilesModule,
    LocationsModule,
    OrdersModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
