import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "@prisma/client";

export const GetCurrentUser = createParamDecorator(
  (data: keyof User, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  }
);
