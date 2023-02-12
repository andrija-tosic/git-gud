import { Submission, SubmissionDocument, User, UserDocument } from '@git-gud/entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from '@git-gud/entities';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>
  ) {}

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

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    await this.submissionModel.deleteMany({ author: id }).exec();

    return user;
  }
}
