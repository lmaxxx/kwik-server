import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors
} from "@nestjs/common";
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto } from "./dto";
import { UpdateUserDto } from "./dto";
import { SerializeDataInterceptor } from "../common/interceptors";
import { GetCurrentUser } from "../common/decorators";


@Controller('user')
@UseInterceptors(new SerializeDataInterceptor(UserResponseDto))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Get()
  findAll(@GetCurrentUser("id") id: string) {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
