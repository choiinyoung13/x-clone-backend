import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadModule } from "../../common/upload/upload.module";

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    UploadModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
