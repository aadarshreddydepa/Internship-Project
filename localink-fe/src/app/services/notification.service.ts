import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | undefined;
  public notification$ = new Subject<string>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public startConnection(userId: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5138/notifications', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started for user:', userId);
        this.hubConnection?.invoke('JoinGroup', `client_${userId}`)
          .catch(err => console.error('Error joining group: ', err));
      })
      .catch(err => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('New notification received:', message);
      this.notification$.next(message);
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
