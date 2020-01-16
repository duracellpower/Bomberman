import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public username: string;

  constructor(private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
  }

  sendUsername() {
    this.http.post<{hash: string}>('http://localhost:3000/login/', { username: this.username })
      .pipe(catchError(() => [{ hash: 'asdf' }]))
      .subscribe(response => {
        window.localStorage.setItem('hash', response.hash);
        this.router.navigate(['/game']);
      });
  }

}
