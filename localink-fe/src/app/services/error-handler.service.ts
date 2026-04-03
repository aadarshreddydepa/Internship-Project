import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type ErrorCode = '404' | '500' | '503' | '401' | '403' | 'connection' | 'timeout' | 'generic';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private router: Router) {}

  /**
   * Navigate to error page with specific error code
   * @param code - The error code to display
   * @param customMessage - Optional custom message to override default
   */
  showError(code: ErrorCode, customMessage?: string): void {
    const queryParams: { code: string; message?: string } = { code };
    if (customMessage) {
      queryParams.message = customMessage;
    }
    this.router.navigate(['/error'], { queryParams });
  }

  /**
   * Show 404 Not Found error
   */
  showNotFound(message?: string): void {
    this.showError('404', message);
  }

  /**
   * Show 500 Server Error
   */
  showServerError(message?: string): void {
    this.showError('500', message);
  }

  /**
   * Show 503 Service Unavailable
   */
  showServiceUnavailable(message?: string): void {
    this.showError('503', message);
  }

  /**
   * Show 401 Unauthorized
   */
  showUnauthorized(message?: string): void {
    this.showError('401', message);
  }

  /**
   * Show 403 Forbidden
   */
  showForbidden(message?: string): void {
    this.showError('403', message);
  }

  /**
   * Show connection error
   */
  showConnectionError(message?: string): void {
    this.showError('connection', message);
  }

  /**
   * Show timeout error
   */
  showTimeoutError(message?: string): void {
    this.showError('timeout', message);
  }

  /**
   * Show generic error
   */
  showGenericError(message?: string): void {
    this.showError('generic', message);
  }

  /**
   * Handle HTTP error responses and navigate to appropriate error page
   * @param status - HTTP status code
   * @param message - Optional custom message
   */
  handleHttpError(status: number, message?: string): void {
    switch (status) {
      case 400:
        this.showGenericError(message || 'Bad request. Please check your input.');
        break;
      case 401:
        this.showUnauthorized(message);
        break;
      case 403:
        this.showForbidden(message);
        break;
      case 404:
        this.showNotFound(message);
        break;
      case 408:
        this.showTimeoutError(message);
        break;
      case 500:
        this.showServerError(message);
        break;
      case 502:
      case 503:
      case 504:
        this.showServiceUnavailable(message);
        break;
      default:
        this.showGenericError(message || `An unexpected error occurred (${status})`);
    }
  }
}
