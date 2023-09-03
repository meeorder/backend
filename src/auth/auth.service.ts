import { RegisterDto } from '@/auth/dto/register.dto';
import { RegisterResponseDto } from '@/auth/dto/register.response.dto';
import { UserRole, UserSchema } from '@/schema/users.schema';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReturnModelType } from '@typegoose/typegoose';
import * as argon2 from 'argon2';
import { InjectModel } from 'nest-typegoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserSchema)
    private UserModel: ReturnModelType<typeof UserSchema>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<string> {
    const user = await this.usersService.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Username or password is incorrect',
      });
    }
    const isMatched = await argon2.verify(user.password, password);

    if (isMatched) {
      const token = await this.jwtService.signAsync(
        {
          username: user.username,
          id: user.id,
          role: user.role,
        },
        { expiresIn: user.role > UserRole.Employee ? '30d' : '1d' },
      );

      return token;
    } else {
      throw new UnauthorizedException({
        message: 'Username or password is incorrect',
      });
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const hash = await argon2.hash(registerDto.password);
    const registerUser = await this.UserModel.create({
      username: registerDto.username,
      password: hash,
      role: UserRole.Customer,
    });
    return {
      _id: registerUser._id,
      username: registerUser.username,
      role: registerUser.role,
    };
  }
}
