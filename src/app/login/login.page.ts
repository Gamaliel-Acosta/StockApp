import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
} from '@ionic/angular';
import { Router } from '@angular/router';
import axios from 'axios';

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

type RouteTarget = 'email' | 'password' | 'button';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonSpinner,
  ],
})
export class LoginPage {
  private readonly API_URL = '/api/login.php';

  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  private routeAnimation?: Animation;

  @ViewChild('routePath')
  private routePath?: ElementRef<SVGPathElement>;

  constructor(private readonly router: Router) {}

  moveRouteTo(target: RouteTarget): void {
    const path = this.routePath?.nativeElement;
    if (!path) {
      return;
    }

    const targetOffset = {
      email: 0,
      password: -336,
      button: -730,
    }[target];
    const targetDasharray = target === 'button' ? '530 1386' : '240 1386';
    const computedStyle = getComputedStyle(path);
    const currentOffset = computedStyle.strokeDashoffset || '0';
    const currentDasharray = computedStyle.strokeDasharray || '240 1386';

    this.routeAnimation?.cancel();
    this.routeAnimation = path.animate(
      [
        {
          strokeDashoffset: currentOffset,
          strokeDasharray: currentDasharray,
        },
        {
          strokeDashoffset: `${targetOffset}`,
          strokeDasharray: targetDasharray,
        },
      ],
      {
        duration: 700,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );
  }

  async login(): Promise<void> {
    this.errorMessage = '';

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;

    try {
      const response = await axios.post<LoginResponse>(
        this.API_URL,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      if (!response.data.success || !response.data.user) {
        this.errorMessage = response.data.message || 'No fue posible iniciar sesión.';
        return;
      }

      localStorage.setItem('user', JSON.stringify(response.data.user));
      void this.router
        .navigate(['/tabs/tab1'], { replaceUrl: true })
        .then((navigated) => {
          if (!navigated) {
            localStorage.removeItem('user');
            this.errorMessage = 'No se pudo abrir la pantalla principal.';
          }
        })
        .catch(() => {
          localStorage.removeItem('user');
          this.errorMessage = 'No se pudo abrir la pantalla principal.';
        });
    } catch (error: unknown) {
      if (axios.isAxiosError<LoginResponse>(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          this.errorMessage = 'El API tardó demasiado en responder.';
        } else if (error.response) {
          this.errorMessage =
            error.response.data?.message ||
            `Error del API (${error.response.status}).`;
        } else {
          this.errorMessage =
            'No se pudo conectar con el API. Verifica que myfirstapp.test:8080 responda y que CORS esté habilitado.';
        }
      } else {
        this.errorMessage = 'Ocurrió un error inesperado al iniciar sesión.';
      }
    } finally {
      this.loading = false;
    }
  }

  onEnter(event: Event): void {
    event.preventDefault();
    if (!this.loading) {
      void this.login();
    }
  }
}
