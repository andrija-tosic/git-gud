import { CreateSubmissionDto, UpdateSubmissionDto } from '@git-gud/entities';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { Response } from 'express';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  create(@Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionService.makeSubmission(null, createSubmissionDto, 'Create');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Patch(':id')
  async updateSubmission(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionService.makeSubmission(id, updateSubmissionDto, 'Update');
  }

  @Delete(':id')
  async deleteSubmission(@Param('id') id: string, @Res() res: Response) {
    const problem = await this.submissionService.remove(id);

    if (!problem) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      res.send(problem);
    }
  }

  @Get(':problemId/solutions')
  problemSolutions(@Param('problemId') problemId: string) {
    return this.submissionService.problemSolutions(problemId);
  }
}
