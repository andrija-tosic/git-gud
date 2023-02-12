import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateProblemDto,
  CreateSubmissionDto,
  Problem,
  ProblemSearchFilters,
  //TODO..........
  // Solution,
  Submission,
  TestCase,
  TestResult,
  UpdateProblemDto,
  UpdateSubmissionDto,
  User,
} from '@git-gud/entities';
import { BehaviorSubject, tap } from 'rxjs';
import { API_URL, HTTP_OPTIONS } from '../constants';

export type Solution = Omit<Submission, 'author' | 'testResults'> & {
  author: User;
  testResults: (Omit<TestResult, 'testCase'> & { testCase: TestCase })[];
};

@Injectable({
  providedIn: 'root',
})
export class ProblemService {
  public selectedProblem$ = new BehaviorSubject<Problem | null>(null);

  constructor(private http: HttpClient) {}

  getProblem(id: string) {
    return this.http
      .get<Problem>(API_URL + '/problems/' + id)
      .pipe(tap((problem) => this.selectedProblem$.next(problem)));
  }

  getProblemWithUserSubmissions(id: string, userId: string) {
    return this.http
      .get<Problem>(API_URL + '/problems/' + id + '/' + userId)
      .pipe(tap((problem) => this.selectedProblem$.next(problem)));
  }

  createProblem(dto: CreateProblemDto) {
    return this.http
      .post<Problem>(API_URL + '/problems/', dto, HTTP_OPTIONS)
      .pipe(tap((problem) => this.selectedProblem$.next(problem)));
  }

  updateProblem(id: string, dto: UpdateProblemDto) {
    return this.http
      .patch<Problem>(API_URL + '/problems/' + id, dto, HTTP_OPTIONS)
      .pipe(tap((problem) => this.selectedProblem$.next(problem)));
  }

  deleteProblem(id: string) {
    return this.http
      .delete<Problem>(API_URL + '/problems/' + id)
      .pipe(tap((problem) => this.selectedProblem$.next(problem)));
  }

  createSubmission(dto: CreateSubmissionDto) {
    return this.http.post<Submission>(API_URL + '/submissions/', dto, HTTP_OPTIONS);
  }

  updateSubmission(id: string, dto: UpdateSubmissionDto) {
    return this.http.patch<Submission>(API_URL + '/submissions/' + id, dto, HTTP_OPTIONS);
  }

  deleteSubmission(id: string) {
    return this.http.delete<Submission>(API_URL + '/submissions/' + id);
  }

  searchProblems(problemFilters: ProblemSearchFilters) {
    return this.http.post<Problem[]>(API_URL + '/problems/search/', problemFilters, HTTP_OPTIONS);
  }

  randomProblem(problemFilters: ProblemSearchFilters) {
    return this.http.post<Problem>(API_URL + '/problems/search/random', problemFilters, HTTP_OPTIONS);
  }

  problemSolutions(id: string) {
    return this.http.get<Solution[]>(API_URL + '/submissions/' + id + '/solutions');
  }
}
