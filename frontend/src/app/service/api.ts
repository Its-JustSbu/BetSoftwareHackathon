import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Api {
  api_Url: string = environment.apiUrl

  //API Calls below
}
