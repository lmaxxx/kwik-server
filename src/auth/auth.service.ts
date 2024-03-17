import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { SignInDto, SignUpDto } from "./dto";
import * as argon from 'argon2';
import { JwtPayload, Tokens } from "./types";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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
    return { ...user , ...tokens }
  }

  async logout() {

  }

  async refresh() {

  }

  async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = {
      id: userId,
      email
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: "15m"
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: "7d"
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }
}
