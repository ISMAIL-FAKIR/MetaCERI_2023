import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'https://pedago.univ-avignon.fr:3155';

  private username: string | null = null;

  // Method to set the current username
  setUsername(username: string): void {
    this.username = username;
  }

  // Method to get the current username
  getUsername(): string | null {
    return this.username;
  }

  // Déclaration des observables pour les messages
  private successMessageSource = new BehaviorSubject<string | null>(null);
  successMessage$ = this.successMessageSource.asObservable();

  private errorMessageSource = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessageSource.asObservable();

  private logoutMessageSource = new BehaviorSubject<string | null>(null);
  logoutMessage$ = this.logoutMessageSource.asObservable();

  private likeMessageSource = new BehaviorSubject<string | null>(null);
  likeMessage$ = this.likeMessageSource.asObservable();

  private commentMessageSource = new BehaviorSubject<string | null>(null);
  commentMessage$ = this.commentMessageSource.asObservable();

  private shareMessageSource = new BehaviorSubject<string | null>(null);
  shareMessage$ = this.shareMessageSource.asObservable();

  constructor(private http: HttpClient) {}

  //affichage message de succès
  showSuccessMessage(statusMsg: string): void {
    this.successMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  //affichage message d'erreur
  showErrorMessage(statusMsg: string): void {
    this.errorMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  //notification de deconnexion
  showLogoutMessage(statusMsg: string): void {
    this.logoutMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  //notification de liker
  showLikeMessage(statusMsg: string): void {
    this.likeMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  //notification de commenter
  showCommentMessage(statusMsg: string): void {
    this.commentMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  //notification de partager
  showShareMessage(statusMsg: string): void {
    this.shareMessageSource.next(statusMsg);
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  // Méthode pour effacer les messages actuels
  clearMessages(): void {
    this.successMessageSource.next(null);
    this.errorMessageSource.next(null);
    this.logoutMessageSource.next(null);
    this.commentMessageSource.next(null);
    this.likeMessageSource.next(null);
    this.shareMessageSource.next(null);
  }

  getPosts(): Observable<any> {
    const url = `${this.baseUrl}/getposts`;
    return this.http.get(url);
  }

  //définir la dernière connexion dans le Local Storage
  setLastLoginTime(): void {
    const currentDate = new Date();
    const lastLoginTime = currentDate.toISOString();
    localStorage.setItem('lastLoginTime', lastLoginTime);
  }

  // Méthode pour récupérer la dernière connexion du Local Storage
  getLastLoginTime(): string | null {
    return localStorage.getItem('lastLoginTime');
  }
}
