// 外部依赖
import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
// 内部依赖
import { SharedModule, ReqInterceptor } from "@shared";
import { KongModule } from "@kong";
import { CloudModule } from "@cloud";
import { AuthModule, TokenGuard } from "@auth";
import {
  ReqController,
  OperateController,
  SettingController,
  UserController,
  TokenController,
  KeyController,
  KongController,
  ObjectController,
  ProductController,
  CategoryController,
} from ".";

/**根应用模块 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => {
        if (!process.env.REDIS_HOST) {
          throw new Error("未配置缓存地址");
        }
        const host = process.env.REDIS_HOST;
        const port = process.env.REDIS_PORT
          ? parseInt(process.env.REDIS_PORT, 10)
          : 6379;
        const db = 1;
        const password = process.env.REDIS_PSW || "";
        const connection = { host, port, db, password };
        console.debug("应用缓存已连接");
        return { connection };
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (!process.env.POSTGRES_HOST) {
          throw new Error("未配置数据库地址");
        }
        const host = process.env.POSTGRES_HOST;
        if (!process.env.POSTGRES_DB) {
          throw new Error("未配置数据库名");
        }
        const port = process.env.POSTGRES_PORT
          ? parseInt(process.env.POSTGRES_PORT, 10)
          : 5432;
        const database = process.env.POSTGRES_DB;
        if (!process.env.POSTGRES_USER) {
          throw new Error("未配置数据库用户");
        }
        const username = process.env.POSTGRES_USER;
        if (!process.env.POSTGRES_PSW) {
          throw new Error("未配置数据库密码");
        }
        const password = process.env.POSTGRES_PSW;
        console.debug("当前环境", process.env.NODE_ENV);
        const synchronize = process.env.NODE_ENV
          ? ["dev", "demo"].includes(process.env.NODE_ENV)
          : false;
        return {
          type: "postgres",
          host,
          port,
          database,
          username,
          password,
          synchronize,
          autoLoadEntities: true,
          poolSize: 20,
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            statement_timeout: 30000,
          },
          logging: process.env.NODE_ENV === "dev",
        } as TypeOrmModuleOptions;
      },
    }),
    SharedModule,
    AuthModule,
    KongModule,
    CloudModule,
  ],
  controllers: [
    ReqController,
    OperateController,
    SettingController,
    UserController,
    TokenController,
    KeyController,
    KongController,
    ObjectController,
    ProductController,
    CategoryController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: TokenGuard },
    { provide: APP_INTERCEPTOR, useClass: ReqInterceptor },
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class AdminModule {}
