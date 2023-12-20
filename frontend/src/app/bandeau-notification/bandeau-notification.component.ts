import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-bandeau-notification',
  templateUrl: './bandeau-notification.component.html',
  styleUrls: ['./bandeau-notification.component.css'],
})
export class BandeauNotificationComponent implements OnInit {
  // Déclaration des variables pour les messages de succès, d'erreur et la dernière heure de connexion
  successMessage: string | null = null;
  errorMessage: string | null = null;
  lastLoginTime: string | null = null;
  logoutMessage: string | null = null;
  likeMessage: string | null = null;
  commentMessage: string | null = null;
  shareMessage: string | null = null;
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Mise à jour du message de succès et réinitialisation du message d'erreur
    this.notificationService.successMessage$.subscribe((message) => {
      this.successMessage = message;
      this.errorMessage = null;

      // Récupérez la date et l'heure de la dernière connexion
      this.lastLoginTime = this.formatLastLoginTime(
        this.notificationService.getLastLoginTime()
      );
    });

    // Mise à jour du message d'erreur et réinitialisation du message de succès
    this.notificationService.errorMessage$.subscribe((message) => {
      this.errorMessage = message;
      this.successMessage = null;
    });

    this.notificationService.logoutMessage$.subscribe((message) => {
      this.logoutMessage = message;
      this.successMessage = null;
      this.errorMessage = null;
    });

    // Update the like and comment messages
    this.notificationService.likeMessage$.subscribe((message) => {
      this.likeMessage = message;
      this.commentMessage = null;
    });

    this.notificationService.commentMessage$.subscribe((message) => {
      this.commentMessage = message;
      this.likeMessage = null;
    });

    this.notificationService.shareMessage$.subscribe((message) => {
      this.shareMessage = message;
      this.successMessage = null;
      this.errorMessage = null;
      this.logoutMessage = null;
      this.likeMessage = null;
      this.commentMessage = null;
    });
  }

  //Affichage de la date et l'heure de la dernière connexion au format DD/MM/YY  HH:MM
  formatLastLoginTime(dateTime: string | null): string | null {
    if (dateTime) {
      const date = new Date(dateTime);
      const formattedDate =
        this.padTwoDigits(date.getDate()) +
        '/' +
        this.padTwoDigits(date.getMonth() + 1) +
        '/' +
        date.getFullYear();
      const formattedTime =
        this.padTwoDigits(date.getHours()) +
        ':' +
        this.padTwoDigits(date.getMinutes());
      return formattedDate + ' ' + formattedTime;
    }
    return null;
  }

  //Ajouter un zéro devant un chiffre si inférieur à 10
  padTwoDigits(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
