import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty, Problem, ProblemSearchFilters, Tag } from '@git-gud/entities';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { ProblemService } from '../../services/problem.service';

@Component({
  selector: 'git-gud-problems',
  templateUrl: './problems.component.html',
})
export class ProblemsComponent implements OnDestroy {
  // TODO:
  // tags = Object.keys(Tag).filter((tag) => {
  //   return isNaN(Number(tag));
  // });

  problems$ = new BehaviorSubject<Problem[]>([]);

  tags = [
    { name: 'Array', value: 'Array' },
    { name: 'String', value: 'String' },
    { name: 'Hash Table', value: 'Hash Table' },
    { name: 'Dynamic Programming', value: 'Dynamic Programming' },
    { name: 'Math', value: 'Math' },
    { name: 'Sorting', value: 'Sorting' },
    { name: 'Greedy', value: 'Greedy' },
    { name: 'Graph Search', value: 'Graph Search' },
    { name: 'Binary Search', value: 'Binary Search' },
    { name: 'Tree', value: 'Tree' },
    { name: 'Martix', value: 'Matrix' },
  ];

  difficulties = [
    { name: 'Easy', value: 0 },
    { name: 'Medium', value: 1 },
    { name: 'Hard', value: 2 },
  ];

  selectedTags$ = new BehaviorSubject<(typeof Tag)[]>([]);
  selectedDifficulties$ = new BehaviorSubject<number[]>([]);

  @ViewChild('searchInput') input: ElementRef;
  public searchValueChanges$ = new BehaviorSubject<string>('');

  destroy$ = new Subject();

  constructor(private problemService: ProblemService, private router: Router) {
    this.problemService.searchProblems({}).subscribe((problems) => {
      this.problems$.next(problems);
    });

    combineLatest([this.searchValueChanges$, this.selectedDifficulties$, this.selectedTags$])
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map(([text, difficulties, tags]) => {

          return <ProblemSearchFilters>{
            title: text.trim(),
            difficulties,
            tags
          };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.problemService.searchProblems(filters).subscribe((problems) => {
          this.problems$.next(problems);
        });
      });
  }

  randomProblem(title: string, tags: (typeof Tag)[], difficulties: Difficulty[]) {

    this.problemService
      .randomProblem({ difficulties, tags, title })
      .subscribe((problem) => this.router.navigate(['/problems/' + problem._id]));
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
