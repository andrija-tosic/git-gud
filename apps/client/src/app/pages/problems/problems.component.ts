import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Problem, ProblemSearchFilters, Tag } from '@git-gud/entities';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
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

  selectedTags: (typeof Tag)[] = [];
  selectedDifficulties: number[] = [];
  searchValue: string;

  @ViewChild('searchInput') input: ElementRef;
  public searchValueChanges$ = new Subject<string>();

  destroy$ = new Subject();

  constructor(private problemService: ProblemService) {
    this.problemService.searchProblems({} as ProblemSearchFilters).subscribe((problems) => {
      this.problems$.next(problems);
    });

    this.searchValueChanges$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((text) => !!text),
        map((text) => {
          return <ProblemSearchFilters>{
            title: text.trim(),
            difficulties: this.selectedDifficulties,
            tags: this.selectedTags,
          };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.problemService.searchProblems(filters).subscribe((problems) => {
          console.log(problems);
          this.problems$.next(problems);
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
