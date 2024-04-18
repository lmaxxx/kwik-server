import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { SignInDto, SignUpDto } from "./dto";
import * as argon from "argon2";
import { JwtPayload, Tokens } from "./types";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { Cache } from "@nestjs/cache-manager";
import { Response } from "express";

const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 2; // 2h starts from seconds
const REFRESH_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 5; // 5d starts from seconds

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cacheManager: Cache
  ) {}

  async signUp(dto: SignUpDto) {
    const possibleUser: User | null = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (possibleUser) throw new BadRequestException(["Email is already in use"]);

    const hashedPassword = await argon.hash(dto.password);
    const user: User = await this.prisma.user.create({
      data: { ...dto, password: hashedPassword }
    });
    const tokens: Tokens = await this.getTokens(user.id, user.email);

    return { user, tokens };
  }

  async signIn(dto: SignInDto) {
    const user: User | null = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) throw new BadRequestException(["Incorrect email or password"]);

    const passwordMatches = await argon.verify(user.password, dto.password);
    if (!passwordMatches) throw new BadRequestException(["Incorrect email or password"]);

    const tokens: Tokens = await this.getTokens(user.id, user.email);

    return { user, tokens };
  }

  async refresh(id: string) {
    const refreshToken = await this.cacheManager.get(`${id}:refresh_token`);
    const user: User | null = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!refreshToken || !user) throw new ForbiddenException(["Access Denied"]);

    const tokens: Tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = {
      id: userId,
      email
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: ACCESS_TOKEN_EXPIRATION_TIME
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: "5d"
      })
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async setJwtTokens(userId: string, tokens: Tokens, res: Response) {
    res.cookie("access_token", tokens.accessToken, { httpOnly: true, maxAge: 1000 * ACCESS_TOKEN_EXPIRATION_TIME });
    res.cookie("refresh_token", tokens.refreshToken, { httpOnly: true, maxAge: 1000 * REFRESH_TOKEN_EXPIRATION_TIME });
    await this.cacheManager.set(`${userId}:refresh_token`, tokens.refreshToken, REFRESH_TOKEN_EXPIRATION_TIME);
  }

  async clearJwtTokens(userId: string, res: Response) {
    await this.cacheManager.del(`${userId}:refresh_token`);
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
  }
}
