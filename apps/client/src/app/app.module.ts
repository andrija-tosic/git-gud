import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './pages/login/login.component';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { RegisterComponent } from './pages/register/register.component';
import { HttpClientModule } from '@angular/common/http';

import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ProblemsComponent } from './pages/problems/problems.component';
import { UserComponent } from './pages/user/user.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ProblemComponent } from './pages/problem/problem.component';
import { ProblemDifficultyPipe } from './pipes/problem-difficulty.pipe';
import { EditorModule } from 'primeng/editor';
import { DropdownModule } from 'primeng/dropdown';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { SubmissionStatusPipe } from './pipes/submission-status.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProblemSubmitComponent } from './problem-submit/problem-submit.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MarkdownModule } from 'ngx-markdown';
import { MessageErrorStatusPipe } from './pipes/message-error-status.pipe';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavigationComponent,
    ProblemsComponent,
    UserComponent,
    ProblemComponent,
    ProblemDifficultyPipe,
    SubmissionStatusPipe,
    ProblemSubmitComponent,
    MessageErrorStatusPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CheckboxModule,
    InputTextModule,
    ButtonModule,
    MenubarModule,
    SelectButtonModule,
    TableModule,
    EditorModule,
    DropdownModule,
    CodemirrorModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    MarkdownModule.forRoot(),
    ToastModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
