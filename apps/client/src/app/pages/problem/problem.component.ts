/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-useless-escape */
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Problem, ProgrammingLanguage, Submission, User } from '@git-gud/entities';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { PROGRAMMING_LANGUAGES } from '../../constants';

import { ProblemService, Solution } from '../../services/problem.service'; // TODO........
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-problem',
  templateUrl: './problem.component.html',
  providers: [ConfirmationService, MessageService],
})
export class ProblemComponent implements OnDestroy {
  destroy$ = new Subject();

  problem$ = this.problemService.selectedProblem$;

  solutions$ = new BehaviorSubject<Solution[]>([]);
  selectedSolution$ = new BehaviorSubject<Solution | null>(null);

  currentSubmission$: Observable<Submission | undefined>;

  user$ = this.userService.loggedInUser$;

  code = '';

  loading = false;

  languages: ProgrammingLanguage[] = [...PROGRAMMING_LANGUAGES];

  selectedLanguage$ = new BehaviorSubject<ProgrammingLanguage>(this.languages[0]);

  codemirrorOptions = {
    lineNumbers: true,
    theme: 'nord',
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
    mode: this.languages[0].name.toLowerCase(),
  };

  codemirrorOptionsSolution = {
    lineNumbers: true,
    theme: 'nord',
    readOnly: true,
    mode: this.languages[0].name.toLowerCase(),
  };

  readonly codemirrorMarkdownOptions = {
    lineNumbers: false,
    theme: 'nord',
    mode: 'markdown',
    readOnly: true,
    lineWrapping: true,
  };

  constructor(
    private problemService: ProblemService,
    private userService: UserService,
    private route: ActivatedRoute,
    public router: Router,
    private confirmationService: ConfirmationService,
    public messageService: MessageService
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const id = paramMap.get('id')!;
      this.problemService.getProblem(id).subscribe((problem) => {
        this.problem$.next(problem);
      });

      this.problemService.problemSolutions(id).subscribe((solutions) => {
        this.solutions$.next(solutions);
        this.selectedSolution$.next(solutions[0]);
      });

      this.selectedSolution$
        .pipe(
          takeUntil(this.destroy$),
          filter((solution) => !!solution),
          tap((solution) => {
            this.codemirrorOptionsSolution = {
              ...this.codemirrorOptionsSolution,
              mode: PROGRAMMING_LANGUAGES.find((l) => l.id === solution!.programmingLanguage)!.codemirrorMode,
            };
          })
        )
        .subscribe();
    });

    combineLatest([this.problem$, this.user$, this.selectedLanguage$])
      .pipe(filter((problemAndUser) => problemAndUser[0] !== null && problemAndUser[1] !== null))
      .subscribe(([problem, user, selectedLanguage]) => {
        this.languages = PROGRAMMING_LANGUAGES.filter((l) => problem!.programmingLanguagesIds.includes(l.id));

        this.changeCodeTemplate(problem!, user!, selectedLanguage);

        this.currentSubmission$ = this.problem$.pipe(
          map((problem) => {
            return problem?.submissions.find((s) => {
              return s.author === user!._id && s.programmingLanguage === selectedLanguage.id;
            });
          })
        );
      });
  }

  changeCodeTemplate(problem: Problem, user: User, selectedLanguage: ProgrammingLanguage) {
    const userSubmission = problem.submissions.find((s) => {
      return s.author === user._id && s.programmingLanguage === selectedLanguage.id;
    });

    if (userSubmission) {
      this.code = userSubmission.code;
    } else {
      this.code = this.languages.find((l) => l.id === selectedLanguage.id)!.codeTemplate;
    }

    this.codemirrorOptions = {
      ...this.codemirrorOptions,
      mode: selectedLanguage.codemirrorMode,
    };
  }

  submitCode(problem: Problem, user: User, selectedLanguage: ProgrammingLanguage) {
    this.loading = true;
    const userSubmission = problem.submissions.find((s) => {
      return s.author === user._id && s.programmingLanguage === selectedLanguage.id;
    });

    if (userSubmission) {
      this.problemService
        .updateSubmission(problem._id, userSubmission._id, {
          author: user._id!,
          code: this.code,
          programmingLanguage: selectedLanguage.id,
        })
        .subscribe((_) => {
          // this.problem$.next(updatedProblem);
          console.log(_.submissions);

          this.loading = false;
        });
    } else {
      this.problemService
        .createSubmission(problem._id, {
          author: user._id!,
          code: this.code,
          programmingLanguage: selectedLanguage.id,
        })
        .subscribe((_) => {
          // this.problem$.next(updatedProblem);

          this.loading = false;
        });
    }
  }

  deleteProblem(problem: Problem) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete problem "${problem.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Problem deleted' });
        this.problemService.deleteProblem(problem._id).subscribe((_p) => this.router.navigate(['/']));
      },
    });
  }

  deleteSubmission(problem: Problem, submission: Submission) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete your submission?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.problemService.deleteSubmission(problem._id, submission._id).subscribe((problem) => {
          this.problem$.next(problem);
          this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Subission deleted' });
        });
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
