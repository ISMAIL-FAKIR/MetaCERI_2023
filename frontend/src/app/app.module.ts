import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { BandeauNotificationComponent } from './bandeau-notification/bandeau-notification.component';
import { NotificationService } from './notification.service';
import { HomeComponent } from './home/home.component';
import { ServicesService } from 'src/services/services.service';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BandeauNotificationComponent,
    HomeComponent,
  ],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatCardModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    BrowserAnimationsModule,
  ],
  providers: [ServicesService, NotificationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
