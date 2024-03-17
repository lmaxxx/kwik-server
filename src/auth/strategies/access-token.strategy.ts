import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../types";
import { PrismaService } from "../../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([AccessTokenStrategy.extractAccessTokenFromCookie]),
      secretOrKey: config.get<string>("ACCESS_TOKEN_SECRET")
    });
  }

  private static extractAccessTokenFromCookie(req: Request) {
    if (req?.cookies?.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }

  async validate(payload: JwtPayload) {
    const user: User | null = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
