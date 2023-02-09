import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PROGRAMMING_LANGUAGES } from '../constants';
import { ProblemService } from '../services/problem.service';

@Component({
  providers: [MessageService],
  selector: 'git-gud-problem-submit',
  templateUrl: './problem-submit.component.html',
})
export class ProblemSubmitComponent {
  form: FormGroup;

  problem$ = this.problemService.selectedProblem$;

  codemirrorOptions = {
    theme: 'nord',
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
    },
    mode: 'markdown',
    lineWrapping: true,
  };

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

  languages = [...PROGRAMMING_LANGUAGES];

  problemId: string | null = null;

  constructor(
    private problemService: ProblemService,
    private route: ActivatedRoute,
    private router: Router,
    public messageService: MessageService
  ) {
    this.form = new FormGroup({
      // _id: new FormControl(0),
      title: new FormControl('', { validators: Validators.required }),
      text: new FormControl('', { validators: Validators.required }),
      programmingLanguagesIds: new FormControl([this.languages[0].id], { validators: Validators.required }),
      difficulty: new FormControl(0, { validators: Validators.required }),
      tags: new FormControl([this.tags[0].name], { validators: Validators.required }),
      testCases: new FormArray([this.defaultTestCaseFormGroup], { validators: Validators.required }),
    });

    route.paramMap.subscribe((paramMap) => {
      this.problemId = paramMap.get('id');
      if (this.problemId) {
        // TODO: this.problem$.pipe(take(1))
        this.problemService.getProblem(this.problemId).subscribe((problem) => {
          this.form.patchValue({
            _id: problem._id,
            title: problem.title,
            text: problem.text,
            programmingLanguagesIds: problem.programmingLanguagesIds,
            difficulty: problem.difficulty,
            tags: problem.tags,
          });

          (this.form.get('testCases') as FormArray).removeAt(0);

          for (const testCase of problem.testCases) {
            (this.form.get('testCases') as FormArray).push(
              new FormGroup({
                _id: new FormControl(testCase._id),
                input: new FormControl(testCase.input, { validators: Validators.required }),
                desiredOutput: new FormControl(testCase.desiredOutput, { validators: Validators.required }),
                explanation: new FormControl(testCase.explanation),
                cpuTimeLimit: new FormControl(testCase.cpuTimeLimit),
                memoryUsageLimit: new FormControl(testCase.memoryUsageLimit),
              })
            );
          }
        });
      }
    });
  }

  get defaultTestCaseFormGroup() {
    return new FormGroup({
      // _id: new FormControl(0),
      input: new FormControl('', { validators: Validators.required }),
      desiredOutput: new FormControl('', { validators: Validators.required }),
      explanation: new FormControl(''),
      cpuTimeLimit: new FormControl(10.0),
      memoryUsageLimit: new FormControl(16384),
    });
  }

  addTestCase() {
    (this.form?.get('testCases') as FormArray).push(this.defaultTestCaseFormGroup);
  }

  removeTestCase(index: number) {
    (this.form?.get('testCases') as FormArray).removeAt(index);
  }

  onConfirm() {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      for (const control in this.form.controls) {
        if (this.form.controls[control].invalid) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: control[0].toUpperCase() + control.slice(1) + ' cannot be empty.',
          });
        }
      }
      return;
    }

    const apiCall = this.problemId
      ? this.problemService.updateProblem(this.problemId, this.form.getRawValue())
      : this.problemService.createProblem(this.form.getRawValue());

    apiCall.subscribe((problem) => this.router.navigate(['/problems/' + problem._id]));
  }
}
