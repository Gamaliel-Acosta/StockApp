
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  LoadingController,
  AlertController,
  ToastController
} from '@ionic/angular';
import { animate, JSAnimation } from 'animejs';
import axios from 'axios';

@Component({
  selector: 'app-login-pipe',
  imports: [IonContent, CommonModule, FormsModule],
  template: `
    <ion-content>
      <div class="page">
        <div class="container">

          <div class="left">
            <div class="login">Login</div>

            <div class="eula">
              By logging in you agree to the ridiculously long terms
              that you didn't bother to read
            </div>
          </div>

          <div class="right">

            <svg viewBox="0 0 320 300">
              <defs>
                <linearGradient
                  inkscape:collect="always"
                  id="linearGradient"
                  x1="13"
                  y1="193.49992"
                  x2="307"
                  y2="193.49992"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    style="stop-color:#ff00ff;"
                    offset="0"
                    id="stop876"
                  />

                  <stop
                    style="stop-color:#ff0000;"
                    offset="1"
                    id="stop878"
                  />
                </linearGradient>
              </defs>

              <path
                id="animated-path"
                d="m 40,120.00016 239.99984,-3.2e-4
                c 0,0 24.99263 0.79932 25.00016,35.00016
                0.008,34.20084 -25.00016,35 -25.00016,35
                h -239.99984
                c 0,-0.0205 -25,4.01348 -25,38.5
                0,34.48652 25,38.5 25,38.5
                h 215
                c 0,0 20,-0.99604 20,-25
                0,-24.00396 -20,-25 -20,-25
                h -190
                c 0,0 -20,1.71033 -20,25
                0,24.00396 20,25 20,25
                h 168.57143"
              />
            </svg>

            <form
              (ngSubmit)="login()"
              class="form"
            >

              <label for="email">
                Email
              </label>

              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                (focus)="onEmailFocus()"
                placeholder="admin@example.com"
                required
                autocomplete="email"
              />

              <label for="password">
                Password
              </label>

              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                (focus)="onPasswordFocus()"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />

              <input
                type="submit"
                id="submit"
                [value]="isLoading ? 'Iniciando...' : 'Submit'"
                (focus)="onSubmitFocus()"
                [disabled]="isLoading"
              />

            </form>
          </div>

        </div>
      </div>
    </ion-content>
  `,

  styles: [`
    @import url('https://rsms.me/inter/inter-ui.css');

    ::selection {
      background: #2D2F36;
    }

    ::-webkit-selection {
      background: #2D2F36;
    }

    ::-moz-selection {
      background: #2D2F36;
    }

    :host {
      font-family: 'Inter UI', sans-serif;
    }

    ion-content {
      --background: white;
    }

    .page {
      background: #e2e2e5;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      justify-content: center;
      align-items: center;
    }

    @media (max-width: 767px) {
      .page {
        height: 100%;
        margin-bottom: 0px;
        padding-bottom: 0px;
      }
    }

    .container {
      display: flex;
      height: 320px;
      margin: 0 auto;
      width: 640px;
    }

    @media (max-width: 767px) {
      .container {
        flex-direction: column;
        height: 630px;
        width: 320px;
      }
    }

    .left {
      background: white;
      height: calc(100% - 40px);
      top: 20px;
      position: relative;
      width: 50%;
    }

    @media (max-width: 767px) {
      .left {
        height: 100%;
        left: 20px;
        width: calc(100% - 40px);
        max-height: 270px;
      }
    }

    .login {
      font-size: 50px;
      font-weight: 900;
      margin: 50px 40px 40px;
    }

    .eula {
      color: #999;
      font-size: 14px;
      line-height: 1.5;
      margin: 40px;
    }

    .right {
      background: #474A59;
      box-shadow: 0px 0px 40px 16px rgba(0, 0, 0, 0.22);
      color: #F1F1F2;
      position: relative;
      width: 50%;
    }

    @media (max-width: 767px) {
      .right {
        flex-shrink: 0;
        height: 100%;
        width: 100%;
        max-height: 350px;
      }
    }

    svg {
      position: absolute;
      width: 320px;
    }

    path {
      fill: none;
      stroke: url(#linearGradient);
      stroke-width: 4;
      stroke-dasharray: 240 1386;
    }

    .form {
      margin: 40px;
      position: absolute;
    }

    label {
      color: #c2c2c5;
      display: block;
      font-size: 14px;
      height: 16px;
      margin-top: 20px;
      margin-bottom: 5px;
    }

    input {
      background: transparent;
      border: 0;
      color: #f2f2f2;
      font-size: 20px;
      height: 30px;
      line-height: 30px;
      outline: none !important;
      width: 100%;
    }

    input::-moz-focus-inner {
      border: 0;
    }

    #submit {
      color: #707075;
      margin-top: 40px;
      transition: color 300ms;
      cursor: pointer;
    }

    #submit:focus {
      color: #f2f2f2;
    }

    #submit:active {
      color: #d0d0d2;
    }

    #submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
})
export class LoginPipe implements OnInit {

  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  // URL de la API
  apiUrl: string = '/api/login.php';

  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);

  currentAnimation: JSAnimation | null = null;

  constructor() {}

  ngOnInit(): void {
    console.log(
      'LoginPipe component initialized with OnInit.'
    );
  }

  onEmailFocus() {

    if (this.currentAnimation) {
      this.currentAnimation.pause();
    }

    this.currentAnimation = animate(
      '#animated-path',
      {
        strokeDashoffset: {
          to: 0,
          duration: 700,
          ease: 'outQuart',
        },

        strokeDasharray: {
          to: '240 1386',
          duration: 700,
          ease: 'outQuart',
        },
      }
    );
  }

  onPasswordFocus() {

    if (this.currentAnimation) {
      this.currentAnimation.pause();
    }

    this.currentAnimation = animate(
      '#animated-path',
      {
        strokeDashoffset: {
          to: -336,
          duration: 700,
          ease: 'outQuart',
        },

        strokeDasharray: {
          to: '240 1386',
          duration: 700,
          ease: 'outQuart',
        },
      }
    );
  }

  onSubmitFocus() {

    if (this.currentAnimation) {
      this.currentAnimation.pause();
    }

    this.currentAnimation = animate(
      '#animated-path',
      {
        strokeDashoffset: {
          to: -730,
          duration: 700,
          ease: 'outQuart',
        },

        strokeDasharray: {
          to: '530 1386',
          duration: 700,
          ease: 'outQuart',
        },
      }
    );
  }

  async login() {

    // Validar campos
    if (
      !this.email.trim() ||
      !this.password.trim()
    ) {

      const alert =
        await this.alertController.create({
          header: 'Campos requeridos',

          message:
            'Por favor ingresa tu correo y contraseña.',

          buttons: ['OK'],
        });

      await alert.present();

      return;
    }

    // Mostrar loading
    const loading =
      await this.loadingController.create({
        message: 'Conectando...',
        spinner: 'crescent',
      });

    await loading.present();

    this.isLoading = true;

    try {

      // Consumir API
      const response = await axios.post(
        this.apiUrl,
        {
          email: this.email,
          password: this.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },

          timeout: 10000,
        }
      );

      await loading.dismiss();

      this.isLoading = false;

      // Login exitoso
      if (
        response.data &&
        (
          response.data.status === 'success' ||
          response.status === 200
        )
      ) {

        // Mostrar mensaje de éxito
        const toast =
          await this.toastController.create({
            message:
              response.data.message ||
              '¡Inicio de sesión exitoso!',

            duration: 2000,
            color: 'success',
            position: 'top',
          });

        await toast.present();

        // Guardar información del usuario
        if (response.data.user) {

          localStorage.setItem(
            'currentUser',
            JSON.stringify(
              response.data.user
            )
          );
        }

        // ==========================================
        // REDIRECCIÓN AL DASHBOARD
        // ==========================================
        this.router.navigate([
          '/dashboard'
        ]);

      } else {

        // Credenciales incorrectas
        const alert =
          await this.alertController.create({
            header: 'Error de autenticación',

            message:
              response.data?.message ||
              'Credenciales incorrectas',

            buttons: ['Reintentar'],
          });

        await alert.present();
      }

    } catch (error: any) {

      await loading.dismiss();

      this.isLoading = false;

      let msg =
        'No se pudo conectar con la API en ' +
        this.apiUrl;

      if (error.response?.data?.message) {

        msg =
          error.response.data.message;

      } else if (error.message) {

        msg = error.message;
      }

      const alert =
        await this.alertController.create({
          header: 'Error al iniciar sesión',

          message: msg,

          buttons: ['Aceptar'],
        });

      await alert.present();
    }
  }
}

// Alias para compatibilidad
export {
  LoginPipe as LoginPipeComponent
};
