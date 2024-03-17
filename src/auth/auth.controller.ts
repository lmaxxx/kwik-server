import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "./dto";
import { UserResponseDto } from "../user/dto";
import { SerializeDataInterceptor } from "../common/interceptors";
import { Public } from "../common/decorators";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post("sign-up")
  @Public()
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto)
  }

  @UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post("logout")
  logOut() {
    return this.authService.logout()
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh() {
    return this.authService.refresh()
  }
}
