import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Notfound } from './notfound/notfound';
import { Wallets } from './wallets/wallets';

//Routes config to respective components
export const routes: Routes = [
    {path: '', redirectTo: '/Dashboard', pathMatch: 'full'},
    {path: 'Dashboard', component: Dashboard},
    {path: 'Notfound', component: Notfound},
    {path: '**', redirectTo: '/Notfound'},
    {path: 'Wallets', component: Wallets}
];