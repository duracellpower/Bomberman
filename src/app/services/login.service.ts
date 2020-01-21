import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'}) // dependency injection -> singelton
export class LoginService {
    constructor(private http: HttpClient, private router: Router) {}

    sendUsername(username: string) {
        this.http.post<{hash: string}>('http://localhost:3000/login/', { username }) //server: register player and return hash
        .pipe(catchError(() => [{ hash: 'asdf' }]))
        .subscribe(response => {
            window.localStorage.setItem('hash', response.hash);
            this.router.navigate(['/game']);
        });
    }
}