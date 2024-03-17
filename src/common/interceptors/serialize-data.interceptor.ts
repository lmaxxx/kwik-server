import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { map } from "rxjs";

export class SerializeDataInterceptor implements NestInterceptor {
  constructor(
    private readonly classToUse: ClassConstructor<unknown>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => {
        return plainToInstance(this.classToUse, data);
      })
    );
  }
}
