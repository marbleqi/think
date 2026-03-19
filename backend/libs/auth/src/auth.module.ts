// 外部依赖
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
// 内部依赖
import { SharedModule } from "@shared";
import {
  UserEntity,
  UserLogEntity,
  ProductEntity,
  ProductLogEntity,
  CategoryEntity,
  CategoryLogEntity,
  ShortcutEntity,
  UserService,
  TokenService,
  ShortcutService,
  ProductService,
  CategoryService,
  PassportGateway,
  UserController,
  PassportController,
  ShortcutController,
  ProductController,
  CategoryController,
} from "@auth";

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserLogEntity,
      ProductEntity,
      ProductLogEntity,
      CategoryEntity,
      CategoryLogEntity,
      ShortcutEntity,
    ]),
  ],
  providers: [
    UserService,
    TokenService,
    PassportGateway,
    ProductService,
    CategoryService,
    ShortcutService,
  ],
  controllers: [
    UserController,
    PassportController,
    ProductController,
    CategoryController,
    ShortcutController,
  ],
  exports: [
    UserService,
    TokenService,
    ProductService,
    CategoryService,
    ShortcutService,
  ],
})
export class AuthModule {}
