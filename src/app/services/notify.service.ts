import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Toastify from 'toastify-js';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  success(message: string): void {
    this.show(message, '#198754');
  }

  error(message: string): void {
    this.show(message, '#FB2E2E');
  }

  /** Extrae el mensaje que devuelve la API (Laravel) o uno genérico. */
  httpError(err: HttpErrorResponse): void {
    if (err.status === 0) {
      return this.error('No se pudo conectar con la API. ¿Está corriendo el backend?');
    }
    const errors = err.error?.errors as Record<string, string[]> | undefined;
    const first = errors ? Object.values(errors)[0]?.[0] : undefined;
    this.error(first ?? err.error?.message ?? 'Ocurrió un error inesperado');
  }

  private show(text: string, background: string): void {
    Toastify({ text, duration: 4000, gravity: 'top', position: 'right', style: { background } }).showToast();
  }
}
