import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ErrorConfig {
  code: string;
  title: string;
  message: string;
  icon: string;
  actionText: string;
  secondaryActionText?: string;
}

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit {
  errorConfig: ErrorConfig = {
    code: '404',
    title: 'Page Not Found',
    message: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
    icon: 'search',
    actionText: 'Go Back Home',
    secondaryActionText: 'Try Again'
  };

  private errorConfigs: { [key: string]: ErrorConfig } = {
    '404': {
      code: '404',
      title: 'Page Not Found',
      message: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      icon: 'search',
      actionText: 'Go Back Home',
      secondaryActionText: 'Go Back'
    },
    '500': {
      code: '500',
      title: 'Internal Server Error',
      message: 'Something went wrong on our end. We are working to fix the issue. Please try again later.',
      icon: 'server',
      actionText: 'Go Back Home',
      secondaryActionText: 'Try Again'
    },
    '503': {
      code: '503',
      title: 'Service Unavailable',
      message: 'Our servers are currently undergoing maintenance. Please check back soon.',
      icon: 'maintenance',
      actionText: 'Go Back Home',
      secondaryActionText: 'Refresh Page'
    },
    '401': {
      code: '401',
      title: 'Unauthorized Access',
      message: 'You are not authorized to access this page. Please log in with the appropriate credentials.',
      icon: 'lock',
      actionText: 'Go to Login',
      secondaryActionText: 'Go Back Home'
    },
    '403': {
      code: '403',
      title: 'Access Forbidden',
      message: 'You do not have permission to access this resource.',
      icon: 'shield',
      actionText: 'Go Back Home',
      secondaryActionText: 'Contact Support'
    },
    'connection': {
      code: 'ERR_CONNECTION',
      title: 'Connection Failed',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      icon: 'wifi',
      actionText: 'Try Again',
      secondaryActionText: 'Go Back Home'
    },
    'timeout': {
      code: 'ERR_TIMEOUT',
      title: 'Request Timeout',
      message: 'The server took too long to respond. Please try again later.',
      icon: 'clock',
      actionText: 'Try Again',
      secondaryActionText: 'Go Back Home'
    },
    'generic': {
      code: 'ERR_OCCURRED',
      title: 'An Error Occurred',
      message: 'Something unexpected happened. We apologize for the inconvenience.',
      icon: 'alert',
      actionText: 'Go Back Home',
      secondaryActionText: 'Try Again'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for error code in route data (for wildcard 404 fallback)
    const routeData = this.route.snapshot.data;
    if (routeData?.['errorCode']) {
      this.errorConfig = this.errorConfigs[routeData['errorCode']] || this.errorConfigs['generic'];
      return;
    }

    // Check for error code in query params
    this.route.queryParams.subscribe(params => {
      const errorCode = params['code'] || '404';
      this.errorConfig = this.errorConfigs[errorCode] || this.errorConfigs['generic'];
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  retry(): void {
    window.location.reload();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  handlePrimaryAction(): void {
    switch (this.errorConfig.code) {
      case '401':
        this.goToLogin();
        break;
      case 'connection':
      case 'timeout':
        this.retry();
        break;
      default:
        this.goHome();
    }
  }

  handleSecondaryAction(): void {
    switch (this.errorConfig.code) {
      case '404':
        this.goBack();
        break;
      case '500':
      case 'generic':
        this.retry();
        break;
      case '503':
        this.retry();
        break;
      case '401':
      case '403':
        this.goHome();
        break;
      case 'connection':
      case 'timeout':
        this.goHome();
        break;
      default:
        this.goBack();
    }
  }
}
