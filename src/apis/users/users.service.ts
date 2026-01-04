import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from '../../prisma.extension';
import * as bcrypt from 'bcrypt';
import { User } from "./entities/user.entity";

import { UploadService } from '../../common/upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private uploadService: UploadService,
  ) {
  }

  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
    const exUser = await this.prismaService.client.user.findFirst({
      where: { id: createUserDto.id },
    });
    if (exUser) {
      return 'already_exist';
    }
    console.log('file', file);

    const imageUrl = file
      ? await this.uploadService.uploadFile(file, 'users')
      : null;

    return this.prismaService.client.user.create({
      select: {
        password: false,
        id: true,
        nickname: true,
        image: true,
      },
      data: {
        id: createUserDto.id,
        nickname: createUserDto.nickname,
        image: imageUrl || '',
        password: await bcrypt.hash(createUserDto.password, 12),
      },
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOneInner(id: string) {
    return this.prismaService.client.user.findUnique({
      where: {
        id,
      },
    });
  }

  findOne(id: string, user?: Pick<User, 'id'>) {
    if (user) {
      return this.prismaService.client.user.findUnique({
        select: {
          id: true,
          nickname: true,
          image: true,
          Followers: {
            select: {
              id: true,
            },
            where: {
              id: user.id,
            }
          },
          _count: {
            select: {
              Followers: true,
              Followings: true,
            },
          }
        },
        where: {
          id,
        },
      });
    }
    return this.prismaService.client.user.findUnique({
      select: {
        id: true,
        nickname: true,
        image: true,
        _count: {
          select: {
            Followers: true,
            Followings: true,
          },
        }
      },
      where: {
        id,
      },
    });
  }

  getFollowRecommends(user?: Pick<User, 'id'>) {
    console.log('getFollowRecommends', user);
    const where = user ? {
      Followers: {
        none: {
          id: user.id,
        }
      },
      id: {
        not: user.id
      }
    } : {};
    return this.prismaService.client.user.findMany({
      skip: 0,
      take: 3,
      select: {
        id: true,
        nickname: true,
        image: true,
        Followers: {
          select: {
            id: true,
          },
          where: {
            id: user?.id
          }
        },
        _count: {
          select: {
            Followers: true,
            Followings: true,
          },
        }
      },
      where,
      orderBy: [{
        Followers: {
          _count: 'desc',
        },
      }]
    });
  }

  follow(id: string, user: User) {
    if (id === user.id) {
      return 'self_impossible';
    }
    return this.prismaService.client.user.update({
      where: { id },
      data: {
        Followers: {
          connect: {
            id: user.id,
          }
        }
      }
    })
  }

  unfollow(id: string, user: User) {
    if (id === user.id) {
      return 'self_impossible';
    }
    return this.prismaService.client.user.update({
      where: { id },
      data: {
        Followers: {
          disconnect: {
            id: user.id,
          }
        }
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
