/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-useless-escape */
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Problem, ProgrammingLanguage, Submission, User } from '@git-gud/entities';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, combineLatest, filter, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { CODEMIRROR_THEME, PROGRAMMING_LANGUAGES } from '../../constants';

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

  currentSubmission$ = new BehaviorSubject<Submission | undefined>(undefined);

  user$ = this.userService.loggedInUser$;

  code = '';

  loading = false;

  languages: ProgrammingLanguage[] = [...PROGRAMMING_LANGUAGES];

  selectedLanguage$ = new BehaviorSubject<ProgrammingLanguage>(this.languages[0]);

  codemirrorOptions = {
    lineNumbers: true,
    theme: CODEMIRROR_THEME,
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
    mode: this.languages[0].name.toLowerCase(),
  };

  codemirrorOptionsSolution = {
    lineNumbers: true,
    theme: CODEMIRROR_THEME,
    readOnly: true,
    mode: this.languages[0].name.toLowerCase(),
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
      .pipe(filter((problemAndUser) => !!problemAndUser[0] && !!problemAndUser[1]))
      .subscribe(([problem, user, selectedLanguage]) => {
        this.languages = PROGRAMMING_LANGUAGES.filter((l) => problem!.programmingLanguagesIds.includes(l.id));

        this.changeCodeTemplate(problem!, user!, selectedLanguage);

        const userSubmission = problem?.submissions?.find((s) => {
          return s.author === user!._id && s.programmingLanguage === selectedLanguage.id;
        });

        this.currentSubmission$.next(userSubmission);
      });
  }

  changeCodeTemplate(problem: Problem, user: User, selectedLanguage: ProgrammingLanguage) {
    const userSubmission = problem.submissions?.find((s) => {
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

  submitCode(
    problem: Problem,
    currentSubmission: Submission | undefined,
    user: User,
    selectedLanguage: ProgrammingLanguage
  ) {
    this.loading = true;

    if (currentSubmission) {
      this.problemService
        .updateSubmission(currentSubmission._id, {
          problem: problem._id,
          author: user._id!,
          code: this.code,
          programmingLanguage: selectedLanguage.id,
        })
        .subscribe((submission) => {
          this.currentSubmission$.next(submission);

          this.loading = false;
        });
    } else {
      this.problemService
        .createSubmission({
          problem: problem._id,
          author: user._id!,
          code: this.code,
          programmingLanguage: selectedLanguage.id,
        })
        .subscribe((submission) => {
          this.currentSubmission$.next(submission);

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
        this.problemService.deleteSubmission(submission._id).subscribe((submission) => {
          this.currentSubmission$.next(undefined);
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
