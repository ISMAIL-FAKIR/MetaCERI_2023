import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  url = 'https://pedago.univ-avignon.fr:3155/login'

  constructor(private http: HttpClient) { }

  login(credentials: any): any{
    return this.http.post(this.url, credentials)
  }
}
