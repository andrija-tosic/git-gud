import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { ProblemComponent } from './pages/problem/problem.component';
import { ProblemsComponent } from './pages/problems/problems.component';
import { RegisterComponent } from './pages/register/register.component';
import { UserComponent } from './pages/user/user.component';
import { ProblemSubmitComponent } from './problem-submit/problem-submit.component';

const routes: Routes = [
  { path: '', redirectTo: 'problems', pathMatch: 'full' },
  {
    path: '',
    component: NavigationComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'user/:id', component: UserComponent },
      { path: 'problems', component: ProblemsComponent },
      { path: 'problems/:id', component: ProblemComponent },
      { path: 'problem-submit', component: ProblemSubmitComponent },
      { path: 'problem-submit/:id', component: ProblemSubmitComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '**',
    redirectTo: 'problems',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
