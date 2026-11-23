import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info', message: string, duration = 3200) {
    // If the exact same message is already visible, do not duplicate
    const current = this.toasts();
    if (current.some(t => t.message === message)) {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, duration };

    // Display only the latest toast so notifications never stack or clutter on mobile
    this.toasts.set([toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration = 3500) {
    this.show('success', message, duration);
  }

  error(message: string, duration = 4500) {
    this.show('error', message, duration);
  }

  info(message: string, duration = 3500) {
    this.show('info', message, duration);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
