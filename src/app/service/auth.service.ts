import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { User } from '../../models/user.model';
import { CookieService } from "angular2-cookie/core";
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
  public user: Observable<any>;

  constructor(
      private socketService: SocketService,
      private cookieService: CookieService) {


    this.socketService.status.subscribe(status => {
      // console.log('authService: status changed', status);
      if (status === 'connected') {
        let user = cookieService.getObject('user');
        if (user) {
          console.log('authService: found user in cookies', user);
          socketService.emit('auth:login', user);
        }
      }

    });

    this.user = Observable.create((observer: any) => {

          socketService.on('auth:login', (resp) => {
            let user = new User(resp);
            observer.next(user);
            cookieService.putObject('user', user);
            // console.log('auth ok:', user);
          });

          socketService.on('auth:logout', (resp) => {
            // console.log('user logged out');
            this.cookieService.remove('user');
            let user = new User();
            observer.next(null);
          });

          socketService.on('auth:login:error', (resp) => {
            // console.error(resp);
            // observer.next();
          })
    })

  }

  login(credentials: any): void {
    this.socketService.emit('auth:login', credentials);
  }


  logout() {
    this.socketService.emit('auth:logout', this.user);
  }

}
