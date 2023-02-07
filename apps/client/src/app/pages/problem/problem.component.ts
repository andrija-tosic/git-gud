/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-useless-escape */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Problem, ProgrammingLanguage, Submission, User } from '@git-gud/entities';
import { BehaviorSubject, combineLatest, filter, map, merge, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { ProblemService } from '../../services/problem.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'git-gud-problem',
  templateUrl: './problem.component.html',
  styles: [
    `
      :host ::ng-deep .custom-spinner .p-progress-spinner-circle {
        stroke: rgb(127, 191, 246) !important;
      }

      :host ::ng-deep .custom-spinner .p-progress-spinner-svg {
        animation: p-progress-spinner-rotate 2s cubic-bezier(0.23, 0.88, 0.89, 0.49) infinite;
      }
    `,
  ],
})
export class ProblemComponent {
  problem$ = new BehaviorSubject<Problem | null>(null);

  currentSubmission$: Observable<Submission | undefined>;

  user$ = this.userService.loggedInUser$;

  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code = 'function x() {\nconsole.log("Hello world!");\n}';

  loading = false;

  // languages = this.problemService.languages;

  languages: ProgrammingLanguage[] = [
    {
      id: 50,
      name: 'C',
      codeTemplate: `
#include <stdio.h>
int main(void) {
  char text[10];
  scanf("%s", text);

  
  printf("%s", text);
  return 0;
}`,
    },
    {
      id: 51,
      name: 'C#',
      codeTemplate: `
using System;
public class Program
{
    public static void Main(string[] args)
    {
      string s = Console.ReadLine();
      Console.WriteLine(s);
    }
}`,
    },
    {
      id: 62,
      name: 'Java',
      codeTemplate: `
class Program {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    String s = scanner.nextLine();
    
    System.out.println(s);
  }
}`,
    },
    {
      id: 63,
      name: 'JavaScript',
      codeTemplate: `
process.openStdin().on (
  'data',
  function (line) {
      console.log(line);  
    
      process.exit();
  }
)`,
    },
  ];

  selectedLanguage = this.languages[0];

  codemirrorOptions = {
    lineNumbers: true,
    theme: 'nord',
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
    mode: this.selectedLanguage.name.toLowerCase(),
  };

  constructor(private problemService: ProblemService, private userService: UserService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe((paramMap) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const id = paramMap.get('id')!;
      this.problemService.getProblem(id).subscribe((problem) => {
        this.problem$.next(problem);
      });
    });

    combineLatest([this.problem$, this.user$])
      .pipe(
        filter((problemAndUser) => problemAndUser[0] !== null && problemAndUser[1] !== null),
        take(1)
      )
      .subscribe(([problem, user]) => {
        this.changeCodeTemplate(problem!, user!);

        this.currentSubmission$ = this.problem$.pipe(
          map((problem) =>
            problem?.submissions.find((s) => {
              return s.author === user!._id && s.programmingLanguage === this.selectedLanguage.id;
            })
          )
        );
      });
  }

  changeCodeTemplate(problem: Problem, user: User) {
    const userSubmission = problem.submissions.find((s) => {
      return s.author === user._id && s.programmingLanguage === this.selectedLanguage.id;
    });

    if (userSubmission) {
      this.code = userSubmission.code;
    } else {
      this.code = this.languages.find((l) => l.id === this.selectedLanguage.id)!.codeTemplate;
    }
    this.editorOptions.language = this.selectedLanguage.name;
    this.codemirrorOptions.mode = this.selectedLanguage.name.toLowerCase();
  }

  submitCode(problem: Problem, user: User) {
    this.loading = true;
    const userSubmission = problem.submissions.find((s) => {
      return s.author === user._id && s.programmingLanguage === this.selectedLanguage.id;
    });

    if (userSubmission) {
      this.problemService
        .updateSubmission(problem._id, userSubmission._id, {
          author: user._id!,
          code: this.code,
          programmingLanguage: this.selectedLanguage.id,
        })
        .subscribe((updatedProblem) => {
          this.problem$.next(updatedProblem);

          this.loading = false;
        });
    } else {
      this.problemService
        .createSubmission(problem._id, {
          author: user._id!,
          code: this.code,
          programmingLanguage: this.selectedLanguage.id,
        })
        .subscribe((updatedProblem) => {
          this.problem$.next(updatedProblem);

          this.loading = false;
        });
    }
  }
}
