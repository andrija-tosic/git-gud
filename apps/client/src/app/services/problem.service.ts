import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateProblemDto,
  CreateSubmissionDto,
  Problem,
  ProblemSearchFilters,
  Submission,
  UpdateProblemDto,
  UpdateSubmissionDto,
} from '@git-gud/entities';
import { BehaviorSubject } from 'rxjs';
import { API_URL, HTTP_OPTIONS } from '../constants';
import { ProgrammingLanguage } from '@git-gud/entities';

@Injectable({
  providedIn: 'root',
})
export class ProblemService {
  public selectedProblem$ = new BehaviorSubject<Problem | null>(null);

  // public languages: ProgrammingLanguage[] = [];

  constructor(private http: HttpClient) {
    // this.getLanguages().subscribe((languages) => (this.languages = languages));
  }

  getProblem(id: string) {
    return this.http.get<Problem>(API_URL + '/problems/' + id);
  }

  // getLanguages() {
  // return this.http.get<ProgrammingLanguage[]>('http://localhost:2358/languages');
  // }

  createProblem(dto: CreateProblemDto) {
    return this.http.post<Problem>(API_URL + '/problems/', dto, HTTP_OPTIONS);
  }

  updateProblem(dto: UpdateProblemDto) {
    return this.http.patch<Problem>(API_URL + '/problems/', dto, HTTP_OPTIONS);
  }

  deleteProblem(id: string) {
    return this.http.delete<Problem>(API_URL + '/problems/' + id);
  }

  createSubmission(id: string, dto: CreateSubmissionDto) {
    return this.http.post<Problem>(API_URL + '/problems/' + id + '/submissions/', dto, HTTP_OPTIONS);
  }

  updateSubmission(id: string, submissionId: string, dto: UpdateSubmissionDto) {
    return this.http.patch<Problem>(API_URL + '/problems/' + id + '/submissions/' + submissionId, dto, HTTP_OPTIONS);
  }

  removeSubmission(id: string, submissionId: string) {
    return this.http.delete<Problem>(API_URL + '/problems/' + id + '/submissions/' + submissionId);
  }

  searchProblems(problemFilters: ProblemSearchFilters) {
    return this.http.post<Problem[]>(API_URL + '/problems/search/', problemFilters, HTTP_OPTIONS);
  }

  randomProblem(problemFilters: ProblemSearchFilters) {
    return this.http.post<Problem[]>(API_URL + '/problems/search/random', problemFilters, HTTP_OPTIONS);
  }

  upvoteProblem(id: string) {
    return this.http.post<Problem>(API_URL + '/problems/' + id + 'upvote', {});
  }

  removeProblemUpvote(id: string) {
    return this.http.delete<Problem>(API_URL + '/problems/' + id + 'upvote', {});
  }

  downvoteProblem(id: string) {
    return this.http.post<Problem>(API_URL + '/problems/' + id + 'downvote', {});
  }

  removeProblemDownvote(id: string) {
    return this.http.delete<Problem>(API_URL + '/problems/' + id + 'downvote', {});
  }

  problemSolutions(id: string) {
    return this.http.get<{ _id: string; submissions: Submission[] }>(API_URL + '/problems/' + id + '/solutions');
  }
}
