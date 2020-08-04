import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../admin/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public _auth: AuthService) {
    // redirect to home if already logged in
    if (this._auth.currentUserValue) {
      this.router.navigate(['/admin/cierres']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  login() {
    if (this.loginForm.invalid) {
      return;
    }


    this._auth.login(this.loginForm.value).subscribe(
      resp => {
        if(resp.user.admin == 1 ) {
          return this.router.navigate(['admin/cierres']);
        } else {
          return this.router.navigate(['/']);
        }
        
    }, error => {
        this.msgCredencialesInvalidas();
    });
  }


  msgCredencialesInvalidas() {
    Swal.fire({
      title: 'Credenciales Invalidas',
      text:  'el usuario o password no es correcto',
      type:  'error'
    }).then();
  }

}
