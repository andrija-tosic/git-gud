import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { CreateProblemDto, UpdateProblemDto, ProblemSearchFilters } from '@git-gud/entities';
import { Response } from 'express';

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

  @Get(':id/:userId')
  findOneWithUserSubmissions(@Param('id') id: string, @Param('userId') userId: string) {
    return this.problemService.findOneWithUserSubmissions(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProblemDto: UpdateProblemDto) {
    return this.problemService.update(id, updateProblemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.problemService.remove(id);
  }

  @Post('/search')
  searchProblems(@Body() searchFilters: ProblemSearchFilters) {
    return this.problemService.searchProblems(searchFilters);
  }

  @Post('/search/random')
  async randomProblem(@Body() searchFilters: ProblemSearchFilters, @Res() res: Response) {
    const problem = await this.problemService.randomProblem(searchFilters);
    if (!problem) {
      res.status(HttpStatus.NOT_FOUND).send();
    } else {
      res.send(problem);
    }
  }
}
