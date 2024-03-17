import { IsNotEmpty, IsString } from "class-validator";
import { SignInDto } from "./sign-in.dto";

export class SignUpDto extends SignInDto {
  @IsString({ message: "Name should be a string" })
  @IsNotEmpty({ message: "Name should not be empty" })
  name: string;
}
