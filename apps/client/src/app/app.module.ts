import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
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
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DropdownModule } from 'primeng/dropdown';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { SubmissionStatusPipe } from './pipes/submission-status.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    NavigationComponent,
    ProblemsComponent,
    UserComponent,
    ProblemComponent,
    ProblemDifficultyPipe,
    SubmissionStatusPipe,
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
    MonacoEditorModule.forRoot(),
    DropdownModule,
    CodemirrorModule,
    ProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
