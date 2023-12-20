import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ServicesService } from 'src/services/services.service';
import { Router } from '@angular/router';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null,
  };

  constructor(
    private servicesService: ServicesService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSubmit(f: NgForm): void {
    console.log(this.form);
    this.servicesService.login(this.form).subscribe(
      (data: any) => {
        console.log(data);
        this.notificationService.showSuccessMessage(data.statusMsg);

        // Enregistrez la date et l'heure actuelles dans le Local Storage
        const currentDate = new Date();
        const lastLoginTime = currentDate.toISOString();
        localStorage.setItem('lastLoginTime', lastLoginTime);

        //le bandeau s'efface dans 10 secondes
        setTimeout(() => {
          this.notificationService.clearMessages();
        }, 5000);

        // Rediriger vers le composant Home en cas de succès
        this.router.navigate(['/home']);
      },
      (err: any) => {
        console.log(err);
        this.notificationService.showErrorMessage(err.error.statusMsg);
        setTimeout(() => {
          this.notificationService.clearMessages();
        }, 10000);
      }
    );
  }
}
