import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PostsService } from '../posts/posts.service';
import { MulterModule } from '@nestjs/platform-express';
import { MessagesService } from "../messages/messages.service";
import { memoryStorage } from 'multer';
import { UploadModule } from "../../common/upload/upload.module";

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PostsService, MessagesService],
})
export class UsersModule { }
