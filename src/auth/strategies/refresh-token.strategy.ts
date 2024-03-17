import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    private readonly config: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([RefreshTokenStrategy.extractJwtFromCookie]),
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true
    });
  }

  private static extractJwtFromCookie(req: Request) {
    if (req?.cookies?.refresh_token) {
      return req.cookies.refresh_token;
    }
    return null;
  }

  validate(req: Request, payload: any) {
    return {
      ...payload,
      refreshToken: req.cookies.refresh_token
    }
  }
}
