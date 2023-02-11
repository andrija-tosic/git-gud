import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { CreateProblemDto, UpdateProblemDto, ProblemSearchFilters } from '@git-gud/entities';

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

  @Post('/search')
  searchProblems(@Body() searchFilters: ProblemSearchFilters) {
    return this.problemService.searchProblems(searchFilters);
  }

  @Post('/search/random')
  randomProblem(@Body() searchFilters: ProblemSearchFilters) {
    return this.problemService.randomProblem(searchFilters);
  }
}
