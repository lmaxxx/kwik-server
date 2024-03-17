import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AccessTokenGuard } from "./auth/guards";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new AccessTokenGuard(app.get(Reflector)));
  app.use(cookieParser());
  await app.listen(8080);
}

bootstrap();
