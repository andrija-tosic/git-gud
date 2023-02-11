import { Component, Input } from '@angular/core';
import {  TestResult } from '@git-gud/entities';

@Component({
  selector: 'git-gud-test-results',
  templateUrl: './test-results.component.html',
})
export class TestResultsComponent {
  @Input() testResults: TestResult[];
  @Input() loading: boolean;
  @Input() index: number;
}
