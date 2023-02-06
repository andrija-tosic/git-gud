import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { ProblemService } from './problem.service';
import {
  CreateProblemDto,
  UpdateProblemDto,
  CreateSubmissionDto,
  UpdateSubmissionDto,
  ProblemSearchFilters,
} from '@git-gud/entities';
import { Response } from 'express';
import { tap } from 'rxjs';

@Controller('problems')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Post()
  create(@Body() createProblemDto: CreateProblemDto) {
    return this.problemService.create(createProblemDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.problemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProblemDto: UpdateProblemDto) {
    return this.problemService.update(id, updateProblemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.problemService.remove(id);
  }

  @Post(':id/submissions')
  async createSubmission(
    @Param('id') id: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Res() res: Response
  ) {
    return this.problemService.makeSubmission(id, null, createSubmissionDto, 'Create').pipe(
      tap((problem) => {
        if (!problem) {
          res.status(HttpStatus.NOT_FOUND).send();
        } else {
          res.send(problem);
        }
      })
    );
  }

  @Patch(':id/submissions/:submissionId')
  updateSubmission(
    @Param('id') id: string,
    @Param('submissionId') submissionId: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @Res() res: Response
  ) {
    return this.problemService.makeSubmission(id, submissionId, updateSubmissionDto, 'Update').pipe(
      tap((problem) => {
        if (!problem) {
          res.status(HttpStatus.NOT_FOUND).send();
        } else {
          res.send(problem);
        }
      })
    );
  }

  @Delete(':id/submissions/:submissionId')
  async deleteSubmission(@Param('id') id: string, @Param('submissionId') submissionId: string, @Res() res: Response) {
    const problem = await this.problemService.deleteSubmission(id, submissionId);

    if (!problem) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      res.send(problem);
    }
  }

  @Post('/search')
  searchProblems(@Body() searchFilters: ProblemSearchFilters) {
    return this.problemService.searchProblems(searchFilters);
  }

  @Post('/search/random')
  randomProblem(@Body() searchFilters: ProblemSearchFilters) {
    return this.problemService.randomProblem(searchFilters);
  }

  @Post(':id/upvote')
  upvoteProblem(@Param('id') id: string) {
    return this.problemService.upvoteProblem(id);
  }

  @Delete(':id/upvote')
  removeProblemUpvote(@Param('id') id: string) {
    return this.problemService.removeProblemUpvote(id);
  }

  @Post(':id/downvote')
  downvoteProblem(@Param('id') id: string) {
    return this.problemService.downvoteProblem(id);
  }

  @Delete(':id/downvote')
  removeProblemDownvote(@Param('id') id: string) {
    return this.problemService.removeProblemDownvote(id);
  }

  @Get(':id/solutions')
  problemSolutions(@Param('id') id: string) {
    return this.problemService.problemSolutions(id);
  }
}
