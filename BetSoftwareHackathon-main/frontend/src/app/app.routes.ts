import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Notfound } from './notfound/notfound';
import { Wallets } from './wallets/wallets';
import { BillListComponent } from './bills/bill-list.component';
import { BillCreateComponent } from './bills/bill-create.component';
import { BillDetailComponent } from './bills/bill-detail.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { LogoutComponent } from './auth/logout.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';

//Routes config to respective components
export const routes: Routes = [
    {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: Dashboard},
    {path: 'wallets', component: Wallets},
    {path: 'notfound', component: Notfound},
    
    // Auth Routes
    {path: 'auth/login', component: LoginComponent},
    {path: 'auth/register', component: RegisterComponent},
    {path: 'auth/logout', component: LogoutComponent},
    
            // Bills Routes
        {path: 'bills', component: BillListComponent},
        {path: 'bills/create', component: BillCreateComponent},
        {path: 'bills/:billId', component: BillDetailComponent},
        
        // Profile & Settings Routes
        {path: 'profile', component: ProfileComponent},
        {path: 'settings', component: SettingsComponent},
        
        {path: '**', redirectTo: '/notfound'}
];