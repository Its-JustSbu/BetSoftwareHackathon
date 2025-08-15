import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Api {
  http = inject(HttpClient)
  api_Url: string = environment.apiUrl

  //API Calls below
  //Wallet Management
  CreateWallet(wallet: any): Observable<any> {
    return this.http.post(`${this.api_Url}wallet`, wallet);
  }
  AddFundsToWallet(walletId: number, amount: number): Observable<any> {
    return this.http.post(`${this.api_Url}wallet/${walletId}/add-funds`, { amount });
  }
  GetWallets(): Observable<any> {
    return this.http.get(`${this.api_Url}wallets`);
  }
  GetWalletById(walletId: number): Observable<any> {
    return this.http.get(`${this.api_Url}wallet/${walletId}`);
  }

  //Payment Management
  CreatePayment(payment: any): Observable<any> {
    return this.http.post(`${this.api_Url}payment`, payment);
  }

  //Alert Management
  GetActiveAlerts(): Observable<any> {
    return this.http.get(`${this.api_Url}alerts/active`);
  }
  GetRecentAlerts(): Observable<any> {
    return this.http.get(`${this.api_Url}alerts/recent`);
  }
  UpdateReadAlert(alertId: number): Observable<any> {
    return this.http.put(`${this.api_Url}alerts/${alertId}/read`, {});
  }
  UpdateRemoveAlert(alertId: number): Observable<any> {
    return this.http.delete(`${this.api_Url}alerts/${alertId}`);
  }

  //Dashboard Management
  //Depending on data, will add and remove endpoints
  GetDashboardData(): Observable<any> {
    return this.http.get(`${this.api_Url}dashboard`);
  }
}
