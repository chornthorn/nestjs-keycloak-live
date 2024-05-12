import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
      }),
    }),
    CategoryModule,
    ProductModule,
  ],
})
export class AppModule {}
