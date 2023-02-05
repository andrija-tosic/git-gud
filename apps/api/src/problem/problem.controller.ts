import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { CreateSubmisionDto } from './dto/create-submission.dto';
import { UpdateSubmisionDto as UpdateSubmissionDto } from './dto/update-submission.dto';
import { Response } from 'express';
import { Submission } from '@git-gud/entities';
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
    @Body() createSubmissionDto: CreateSubmisionDto,
    @Res() res: Response
  ) {
    const submission$ = this.problemService.createSubmission;

    return this.problemService.createSubmission(id, createSubmissionDto).pipe(
      tap((problem) => {
        if (!problem) {
          res.status(HttpStatus.NO_CONTENT).send();
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
    @Body() updateSubmissionDto: UpdateSubmissionDto
  ) {
    return this.problemService.updateSubmission(id, submissionId, updateSubmissionDto);
  }

  @Delete(':id/submissions/:submissionId')
  deleteSubmission(@Param('id') id: string, @Param('submissionId') submissionId: string) {
    return this.problemService.deleteSubmission(id, submissionId);
  }
}
