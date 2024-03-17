import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { SignInDto, SignUpDto } from "./dto";
import * as argon from 'argon2';
import { JwtPayload, Tokens } from "./types";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import {Cache} from "@nestjs/cache-manager";

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
    })

    if(possibleUser) {
      throw new BadRequestException()
    }

    const hashedPassword = await argon.hash(dto.password)
    const user: User = await this.prisma.user.create({
      data: {...dto, password: hashedPassword}
    })
    const tokens: Tokens = await this.getTokens(user.id, user.email)
    await this.cacheManager.set(`${user.id}:refresh_token`, tokens.refreshToken, 60 * 60 * 24 * 5)

    return { ...user, ...tokens }
  }

  async signIn(dto: SignInDto) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {email: dto.email}
    })

    if(!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon.verify(user.password, dto.password)
    if(!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens: Tokens = await this.getTokens(user.id, user.email)

    await this.cacheManager.set(`${user.id}:refresh_token`, tokens.refreshToken, 60 * 60 * 24 * 5)
    return { ...user , ...tokens }
  }

  async logout(id: string) {
    await this.cacheManager.del(`${id}:refresh_token`)
  }

  async refresh(id: string) {
    const refreshToken = await this.cacheManager.get(`${id}:refresh_token`)
    const user: User | null = await this.prisma.user.findUnique({
      where: {id}
    })

    if(!refreshToken || !user) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email)
    await this.cacheManager.set(`${user.id}:refresh_token`, tokens.refreshToken, 60 * 60 * 24 * 5)
    return tokens
  }

  async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = {
      id: userId,
      email
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: "2h"
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: "5d"
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }
}
