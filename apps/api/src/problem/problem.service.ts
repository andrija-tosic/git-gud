import { Problem, ProblemDocument, ProblemSearchFilters, Submission, SubmissionDocument } from '@git-gud/entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { CreateProblemDto, UpdateProblemDto } from '@git-gud/entities';
import { MONGODB_PROBLEMS_SEARCH_INDEX } from '../constants';

@Injectable()
export class ProblemService {
  constructor(
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>
  ) {}

  async create(createProblemDto: CreateProblemDto) {
    const problem = await this.problemModel.create(createProblemDto);
    return problem.save();
  }
  
  findOne(id: string) {
    return this.problemModel.findById(id).lean().exec();
  }

  async findOneWithUserSubmissions(id: string, userId: string) {
    const problem = await this.problemModel.findById(id).lean().exec();

    const submissions = (await this.submissionModel.find({ problem: id, author: userId }).lean().exec()) ?? [];

    return <Problem>{
      ...problem,
      submissions,
    };
  }
  
  async update(id: string, updateProblemDto: UpdateProblemDto) {
    const problem = await this.problemModel
      .findByIdAndUpdate(id, updateProblemDto, {
        returnDocument: 'after',
      })
      .lean()
      .exec();

    const submissions = (await this.submissionModel.find({ problem: id }).lean().exec()) ?? [];

    return <Problem>{
      ...problem,
      submissions,
    };
  }

  async remove(id: string) {
    await this.problemModel.findByIdAndDelete(id);
    await this.submissionModel.deleteMany({ problem: new Types.ObjectId(id) });
    return;
  }

  searchProblems(searchFilters: ProblemSearchFilters) {
    if (
      searchFilters.title?.length === 0 &&
      searchFilters.difficulties?.length === 0 &&
      searchFilters.tags?.length === 0
    ) {
      return this.problemModel.find().limit(50).exec();
    }

    const filterQuery: FilterQuery<unknown> = {};

    if (searchFilters.difficulties?.length > 0) {
      filterQuery.difficulty = { $in: searchFilters.difficulties };
    }

    if (searchFilters.tags?.length > 0) {
      filterQuery.tags = { $in: searchFilters.tags };
    }

    const aggregateArgs: PipelineStage[] = [];

    if (searchFilters.title?.trim().length > 0) {
      aggregateArgs.push({
        $search: {
          index: MONGODB_PROBLEMS_SEARCH_INDEX,

          wildcard: {
            query: '*' + searchFilters.title + '*',
            path: { wildcard: '*' },
            allowAnalyzedField: true,
          },
        },
      });
    }

    aggregateArgs.push({ $match: filterQuery });

    return this.problemModel.aggregate(aggregateArgs).limit(50).exec();
  }

  async randomProblem(searchFilters: ProblemSearchFilters) {
    if (
      searchFilters.title?.length === 0 &&
      searchFilters.difficulties?.length === 0 &&
      searchFilters.tags?.length === 0
    ) {
      return (await this.problemModel.aggregate().sample(1).exec())[0] as Promise<Problem>;
    }

    const filterQuery: FilterQuery<unknown> = {};

    if (searchFilters.difficulties?.length > 0) {
      filterQuery.difficulty = { $in: searchFilters.difficulties };
    }

    if (searchFilters.tags?.length > 0) {
      filterQuery.tags = { $in: searchFilters.tags };
    }

    const aggregateArgs: PipelineStage[] = [];

    if (searchFilters.title.trim().length > 0) {
      aggregateArgs.push({
        $search: {
          index: MONGODB_PROBLEMS_SEARCH_INDEX,

          wildcard: {
            query: '*' + searchFilters.title + '*',
            path: { wildcard: '*' },
            allowAnalyzedField: true,
          },
        },
      });
    }

    aggregateArgs.push({ $match: filterQuery });

    const problem = (await this.problemModel.aggregate(aggregateArgs).sample(1).exec())[0] as Problem;

    const submissions = await this.submissionModel.find({ problem: new Types.ObjectId(problem._id) });

    return <Problem>{
      ...problem,
      submissions,
    };
  }
}
