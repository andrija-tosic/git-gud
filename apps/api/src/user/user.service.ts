import { User, UserDocument } from '@git-gud/entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from '@git-gud/entities';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create(createUserDto);
    return user.save();
  }

  login(email: string) {
    return this.userModel.findOne({ email });
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.userModel.findByIdAndUpdate(id, updateUserDto, {
      returnDocument: 'after',
    });

    return user;
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
