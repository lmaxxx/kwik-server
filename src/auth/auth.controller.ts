import { Body, Controller, Post, Res, UseGuards, UseInterceptors } from "@nestjs/common";
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

  @Public()
  @UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
  @Post("sign-up")
  async signUp(@Body() dto: SignUpDto, @Res({passthrough: true}) res: Response) {
    const { user, tokens } = await this.authService.signUp(dto);
    await this.authService.setJwtTokens(user.id, tokens, res);
    return user
  }

  @Public()
  @UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res({passthrough: true}) res: Response) {
    const { user, tokens } = await this.authService.signIn(dto);
    await this.authService.setJwtTokens(user.id, tokens, res);
    return user
  }

  @Post("logout")
  async logout(@Res() res: Response, @GetCurrentUser("id") id: string) {
    await this.authService.clearJwtTokens(id, res);
    res.sendStatus(200);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  async refresh(@Res() res: Response, @GetCurrentUser("id") id: string) {
    const tokens = await this.authService.refresh(id);
    await this.authService.setJwtTokens(id, tokens, res);
    res.sendStatus(200);
  }

}
