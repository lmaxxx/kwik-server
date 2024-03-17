import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto";
import { UpdateUserDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  async findAll() {
    const users: User[] = await this.prisma.user.findMany();
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
