import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public username: string;

  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
  } 

  sendUsername() {
    this.loginService.sendUsername(this.username);
  }

}
