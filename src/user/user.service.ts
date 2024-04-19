import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
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

  async findOne(id: string) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {id}
    });

    if(!user) throw new BadRequestException(["User with current id doesn't exist"])

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user: User | null = await this.prisma.user.update({
        where: {id},
        data: updateUserDto
      });

      return user;
    } catch (error) {
      if(error.code === "P2025") {
        throw new BadRequestException(["User with current id doesn't exist"])
      } else {
        throw new InternalServerErrorException()
      }

    }


  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
