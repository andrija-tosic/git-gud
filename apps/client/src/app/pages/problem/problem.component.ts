/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-useless-escape */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Problem, ProgrammingLanguage, Submission, User } from '@git-gud/entities';
import { ConfirmationService, ConfirmEventType, MessageService } from 'primeng/api';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';
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
  providers: [ConfirmationService, MessageService],
})
export class ProblemComponent {
  problem$ = this.problemService.selectedProblem$;

  currentSubmission$: Observable<Submission | undefined>;

  user$ = this.userService.loggedInUser$;

  code = '';

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
import java.util.Scanner;

class Main {

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
const fs = require('fs');
const data = fs.readFileSync(0, 'utf-8');

console.log(data);  
`,
    },
  ];

  selectedLanguage$ = new BehaviorSubject<ProgrammingLanguage>(this.languages[1]);

  codemirrorOptions = {
    lineNumbers: true,
    theme: 'nord',
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
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
    private messageService: MessageService
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const id = paramMap.get('id')!;
      this.problemService.getProblem(id).subscribe((problem) => {
        this.problem$.next(problem);
      });
    });

    combineLatest([this.problem$, this.user$, this.selectedLanguage$])
      .pipe(filter((problemAndUser) => problemAndUser[0] !== null && problemAndUser[1] !== null))
      .subscribe(([problem, user, selectedLanguage]) => {
        this.languages = this.languages.filter((l) => problem!.programmingLanguagesIds.includes(l.id));

        this.changeCodeTemplate(problem!, user!, selectedLanguage);

        this.currentSubmission$ = this.problem$.pipe(
          map((problem) => {
            const submission = problem?.submissions.find((s) => {
              return s.author === user!._id && s.programmingLanguage === selectedLanguage.id;
            });

            return submission;
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
    this.codemirrorOptions.mode = selectedLanguage.name.toLowerCase();
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
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            break;
        }
      },
    });
  }
}
