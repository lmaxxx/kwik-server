import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "./dto";
import { UserResponseDto } from "../user/dto";
import { SerializeDataInterceptor } from "../common/interceptors";
import { GetCurrentUser, Public } from "../common/decorators";
import { RefreshTokenGuard } from "./guards";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post("sign-up")
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const userWithTokens = await this.authService.signUp(dto);
    res.cookie('access_token', userWithTokens.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 });
    res.cookie('refresh_token', userWithTokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 5 });
    res.send(userWithTokens)
  }

  @UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
  @Public()
  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const userWithTokens = await this.authService.signIn(dto);
    res.cookie('access_token', userWithTokens.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 });
    res.cookie('refresh_token', userWithTokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 5 });
    res.send(userWithTokens)
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refresh(@Res() res: Response, @GetCurrentUser('id') id: string) {
    const tokens = await this.authService.refresh(id);
    res.cookie('access_token', tokens.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 });
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 5 });
    res.send("success")
  }

  @Post("logout")
  async logOut(@Res() res: Response, @GetCurrentUser('id') id: string) {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    await this.authService.logout(id);
    res.send("success")
  }
}
