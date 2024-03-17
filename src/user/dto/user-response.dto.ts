import { $Enums, User as UserPrisma } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserResponseDto implements UserPrisma {
  id: string;
  name: string;
  email: string;

  @Exclude()
  password: string;

  avatar: string;
  language: string;
  theme: string;
  createdAt: Date;
  isActive: boolean;

  @Exclude()
  role: $Enums.Role;
}
