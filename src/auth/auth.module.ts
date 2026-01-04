import { Module } from '@nestjs/common';
import { LocalSerializer } from './local.serializer';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../apis/users/users.service';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    UploadModule,
  ],
  providers: [LocalSerializer, LocalStrategy, UsersService],
})
export class AuthModule { }
