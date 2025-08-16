import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Wallet } from '../models/wallet';
import { PiggyBank } from '../piggy-bank/piggy-bank';

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
  CreateWallet(wallet: Wallet): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/`, wallet);
  }
  AddFundsToWallet(walletId: number, amount: number): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/${walletId}/deposit/`, { amount });
  }
  TransferFunds(fromWalletId: string, toWalletId: string, amount: string): Observable<any> {
    return this.http.post(`${this.api_Url}wallets/${fromWalletId}/transfer/`, { toWalletId, amount });
  }
  GetWallets(): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/`);
  }
  GetWalletById(walletId: string): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/${walletId}/`);
  }
  DeleteWallet(walletId: string): Observable<any> {
    return this.http.delete(`${this.api_Url}wallets/${walletId}/`);
  }
  UpdateWallet(walletId: string, walletData: Wallet): Observable<any> {
    return this.http.put(`${this.api_Url}wallets/${walletId}/`, walletData);
  }
  GetTransactions(walletId: string): Observable<any> {
    return this.http.get(`${this.api_Url}wallets/${walletId}/transactions/`);
  }

  //Piggy Bank Management
  CreatePiggyBank(piggyBank: PiggyBank): Observable<any> {
    return this.http.post(`${this.api_Url}piggybanks/`, piggyBank);
  }
  GetPiggyBanks(): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/`);
  }
  GetPiggyBankById(piggyBankId: string): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/`);
  }
  UpdatePiggyBank(piggyBankId: string, piggyBankData: PiggyBank): Observable<any> {
    return this.http.put(`${this.api_Url}piggybanks/${piggyBankId}/`, piggyBankData);
  }
  DeletePiggyBank(piggyBankId: string): Observable<any> {
    return this.http.delete(`${this.api_Url}piggybanks/${piggyBankId}/`);
  }
  AddMemberToPiggyBank(piggyBankId: string, memberId: string): Observable<any> {
    return this.http.post(`${this.api_Url}piggybanks/${piggyBankId}/add-members/`, { memberId });
  }
  GetMembersInPiggyBank(piggyBankId: string): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/members/`);
  }
  GetContributionsInPiggyBank(piggyBankId: string): Observable<any> {
    return this.http.get(`${this.api_Url}piggybanks/${piggyBankId}/contributions/`);
  }
  ContributeToPiggyBank(piggyBankId: string, amount: string): Observable<any> {
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
