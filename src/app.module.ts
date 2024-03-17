import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { RedisOptions } from "./config";

@Module({
  imports: [
    CacheModule.register(RedisOptions),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule
  ]
})
export class AppModule {
}
