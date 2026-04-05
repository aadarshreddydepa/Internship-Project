import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.info]="toast.type === 'info'">
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
    }

    .toast {
      padding: 14px 24px;
      border-radius: 8px;
      color: #F8F4F0;
      font-size: 14px;
      font-weight: 500;
      min-width: 250px;
      max-width: 350px;
      text-align: center;
      background: linear-gradient(135deg, #343434 0%, #2A2A2A 100%);
      border: 1px solid #484948;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: slideDown 0.3s ease-out;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .toast.success {
      border-color: #C8A97E;
      background: linear-gradient(135deg, #343434 0%, #2A2A2A 100%);
    }

    .toast.error {
      border-color: #f44;
      background: linear-gradient(135deg, #343434 0%, #2A2A2A 100%);
    }

    .toast.info {
      border-color: #B19F91;
      background: linear-gradient(135deg, #343434 0%, #2A2A2A 100%);
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-100%);
        opacity: 0;
      }
    }

    .toast.hiding {
      animation: fadeOut 0.3s ease-in forwards;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (ToastMessage & { id: number })[] = [];
  private subscription: Subscription = new Subscription();
  private toastId = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toast: ToastMessage) => {
      this.showToast(toast);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private showToast(toast: ToastMessage): void {
    const id = ++this.toastId;
    const toastWithId = { ...toast, id };
    this.toasts.push(toastWithId);

    setTimeout(() => {
      this.removeToast(id);
    }, toast.duration);
  }

  private removeToast(id: number): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }
}
