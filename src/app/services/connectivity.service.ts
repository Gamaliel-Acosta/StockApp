import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  private readonly offlineModeSubject = new BehaviorSubject<boolean>(
    typeof navigator !== 'undefined' && !navigator.onLine,
  );
  private started = false;

  readonly offlineMode$ = this.offlineModeSubject.asObservable();

  get isOffline(): boolean {
    return this.offlineModeSubject.value;
  }

  start(): void {
    if (this.started || typeof window === 'undefined') return;

    this.started = true;
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('online', this.handleOnline);
  }

  markOffline(): void {
    if (!this.isOffline) this.offlineModeSubject.next(true);
  }

  markOnline(): void {
    if (this.isOffline) this.offlineModeSubject.next(false);
  }

  isConnectionError(error: unknown): boolean {
    return (typeof navigator !== 'undefined' && !navigator.onLine)
      || (axios.isAxiosError(error) && !error.response);
  }

  private readonly handleOffline = (): void => {
    this.markOffline();
  };

  private readonly handleOnline = (): void => {
    this.markOnline();
  };
}
