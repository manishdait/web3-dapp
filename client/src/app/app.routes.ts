import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Details } from './pages/election/details';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'election/:id', component: Details}
];
