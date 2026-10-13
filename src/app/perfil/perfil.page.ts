import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActionSheetController,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import axios from 'axios';
import { addIcons } from 'ionicons';
import {
  call,
  camera,
  create,
  documentText,
  imageOutline,
  lockClosed,
  mail,
  notifications,
  people,
  person,
  personCircleOutline,
  saveOutline,
  settings,
  shieldCheckmark,
} from 'ionicons/icons';
import { API_ENDPOINTS } from '../config/api.config';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    CommonModule,
    FormsModule,
  ],
})
export class PerfilPage implements OnInit {
  userId: number | string = '';
  name = '';
  username = '';
  email = '';
  phone = '';
  role = '';
  createdAt = '';
  lastLoginAt = '';
  profilePhoto = '';
  savedMessage = '';
  errorMessage = '';
  saving = false;
  editing = false;

  constructor(private readonly actionSheetController: ActionSheetController) {
    addIcons({
      call,
      camera,
      create,
      documentText,
      imageOutline,
      lockClosed,
      mail,
      notifications,
      people,
      person,
      personCircleOutline,
      saveOutline,
      settings,
      shieldCheckmark,
    });
  }

  async ngOnInit(): Promise<void> {
    const currentUser = this.readCurrentUser();
    this.userId = currentUser.id ?? '';
    this.applyUser(currentUser);

    if (this.userId !== '') {
      try {
        const response = await axios.get<ProfileResponse>(API_ENDPOINTS.perfil, {
          params: { user_id: this.userId },
          timeout: 10000,
        });
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'No se pudo cargar el perfil.');
        }
        this.applyUser(response.data.data);
        this.persistUser(response.data.data);
      } catch (error: unknown) {
        this.errorMessage = this.apiErrorMessage(error, 'No se pudo cargar la información del usuario.');
      }
    } else {
      this.errorMessage = 'No se encontró el usuario actual.';
    }

    const { value: savedPhoto } = await Preferences.get({ key: 'profilePhoto' });
    this.profilePhoto = savedPhoto || '';
  }

  async changeProfilePhoto(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar foto de perfil',
      buttons: [
        { text: 'Tomar una foto', icon: 'camera', handler: () => void this.selectPhoto(CameraSource.Camera) },
        { text: 'Elegir del almacenamiento', icon: 'image-outline', handler: () => void this.selectPhoto(CameraSource.Photos) },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  async saveProfile(): Promise<void> {
    const payload = {
      id: this.userId,
      name: this.name.trim(),
      username: this.username.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      role: this.role.trim(),
    };
    if (!payload.name || !payload.email || !payload.role || this.userId === '') {
      this.errorMessage = 'El nombre, el correo, el rol y el usuario actual son obligatorios.';
      this.savedMessage = '';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.savedMessage = '';
    try {
      const response = await axios.patch<ProfileResponse>(API_ENDPOINTS.perfil, payload, { timeout: 10000 });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'No se pudo guardar el perfil.');
      }
      this.applyUser(response.data.data);
      this.persistUser(response.data.data);
      this.savedMessage = 'La información se guardó correctamente.';
      this.editing = false;
    } catch (error: unknown) {
      this.errorMessage = this.apiErrorMessage(error, 'No se pudo guardar la información del usuario.');
    } finally {
      this.saving = false;
    }
  }

  editProfile(): void {
    this.editing = true;
    this.savedMessage = '';
    this.errorMessage = '';
  }

  formatDate(value: string): string {
    if (!value) return 'No registrado';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'No registrado'
      : new Intl.DateTimeFormat('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(date);
  }

  private async selectPhoto(source: CameraSource): Promise<void> {
    this.errorMessage = '';
    try {
      const photo = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.DataUrl, source });
      if (!photo.dataUrl) throw new Error('La imagen seleccionada no está disponible.');
      this.profilePhoto = photo.dataUrl;
      await Preferences.set({ key: 'profilePhoto', value: photo.dataUrl });
    } catch (error: unknown) {
      if (error instanceof Error && /cancel/i.test(error.message)) return;
      this.errorMessage = 'No se pudo actualizar la foto de perfil.';
    }
  }

  private readCurrentUser(): UserProfile {
    const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');
    if (!savedUser) return {};
    try {
      return JSON.parse(savedUser) as UserProfile;
    } catch {
      return {};
    }
  }

  private applyUser(user: Partial<UserProfile>): void {
    this.userId = user.id ?? this.userId;
    this.name = user.name ?? '';
    this.username = user.username ?? '';
    this.email = user.email ?? '';
    this.phone = user.phone ?? '';
    this.role = user.role ?? '';
    this.createdAt = user.createdAt ?? '';
    this.lastLoginAt = user.lastLoginAt ?? '';
  }

  private persistUser(user: UserProfile): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  }

  private apiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
      return error.response?.data?.error || error.response?.data?.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
  }
}

interface UserProfile {
  id?: number | string;
  name?: string;
  username?: string | null;
  email?: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string | null;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data?: UserProfile;
}
