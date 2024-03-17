import { IsEmail, IsString, MinLength } from "class-validator";

export class SignInDto {
  @IsEmail({}, {message: "Invalid email"})
  email: string

  @IsString({message: "Name should be a string"})
  @MinLength(8, {message: "Password should contain at least 8 characters"})
  password: string
}
