import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

/** Shows short feedback messages (replaces browser alert() popups). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private platformId = inject(PLATFORM_ID);
  private nextId = 1;

  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', durationMs = 3000) {
    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.update((list) => [...list, toast]);

    // Only auto-dismiss in the browser (not during server rendering)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }

  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
