import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "./dto";
import { UserResponseDto } from "../user/dto";
import { SerializeDataInterceptor } from "../common/interceptors";
import { Public } from "../common/decorators";

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
    res.cookie('access_token', userWithTokens.accessToken, { httpOnly: true });
    res.send(userWithTokens)
  }

  @UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
  @Public()
  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const userWithTokens = await this.authService.signIn(dto);
    res.cookie('access_token', userWithTokens.accessToken, { httpOnly: true });
    res.send(userWithTokens)
  }

  @Post("logout")
  logOut(@Res() res: Response) {
    res.clearCookie("access_token")
    res.send("success")
    // return this.authService.logout();
  }

  @Post("refresh")
  refresh() {
    return this.authService.refresh();
  }
}
