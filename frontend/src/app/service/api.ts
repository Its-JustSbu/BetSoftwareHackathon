import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Api {
  http = inject(HttpClient)
  api_Url: string = environment.apiUrl

  //API Calls below
  //User Management
  login(username: string, password: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.api_Url}auth/login/`, { username, password });
  }
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.api_Url}auth/profile/`);
  }
  //Wallet Management
  CreateWallet(wallet: any): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/`, wallet);
  }
  AddFundsToWallet(walletId: number, amount: number): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/${walletId}/deposit/`, { amount });
  }
  TransferFunds(fromWalletId: number, toWalletId: number, amount: number): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/${fromWalletId}/transfer/`, { toWalletId, amount });
  }
  GetWallets(): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/`);
  }
  GetWalletById(walletId: number): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/${walletId}/`);
  }
  DeleteWallet(walletId: number): Observable<any> {
    return this.http.delete(`${this.api_Url}wallets/${walletId}/`);
  }
  UpdateWallet(walletId: number, walletData: any): Observable<any> {
    return this.http.put(`${this.api_Url}wallets/${walletId}/`, walletData);
  }
  GetTransactions(walletId: number): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/${walletId}/transactions/`);
  }

  //Piggy Bank Management
  CreatePiggyBank(piggyBank: any): Observable<any> {
    return this.http.post(`${this.api_Url}piggybanks/`, piggyBank);
  }
  GetPiggyBanks(): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/`);
  }
  GetPiggyBankById(piggyBankId: number): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/`);
  }
  UpdatePiggyBank(piggyBankId: number, piggyBankData: any): Observable<any> {
    return this.http.put(`${this.api_Url}piggybanks/${piggyBankId}/`, piggyBankData);
  }
  DeletePiggyBank(piggyBankId: number): Observable<any> {
    return this.http.delete(`${this.api_Url}piggybanks/${piggyBankId}/`);
  }
  AddMemberToPiggyBank(piggyBankId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.api_Url}piggybanks/${piggyBankId}/add-members/`, { memberId });
  }
  GetMembersInPiggyBank(piggyBankId: number): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/members/`);
  }
  GetContributionsInPiggyBank(piggyBankId: number): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/contributions/`);
  }
  ContributeToPiggyBank(piggyBankId: number, amount: number): Observable<any> {
    return this.http.post(`${this.api_Url}piggybanks/${piggyBankId}/contribute/`, { amount });
  }
  //Payment Management
  CreatePayment(payment: any): Observable<any> {
    return this.http.post(`${this.api_Url}payment`, payment);
  }

  //Alert Management
  GetActiveAlerts(): Observable<any> {
    return this.http.get(`${this.api_Url}alerts/active/`);
  }
  GetRecentAlerts(): Observable<any> {
    return this.http.get(`${this.api_Url}alerts/recent/`);
  }
  UpdateReadAlert(alertId: number): Observable<any> {
    return this.http.put(`${this.api_Url}alerts/${alertId}/read/`, {});
  }
  UpdateRemoveAlert(alertId: number): Observable<any> {
    return this.http.delete(`${this.api_Url}alerts/${alertId}/`);
  }

  //Dashboard Management
  //Depending on data, will add and remove endpoints
  GetDashboardData(): Observable<any> {
    return this.http.get(`${this.api_Url}dashboard`);
  }
}
