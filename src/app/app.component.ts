import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './user.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  userForm: FormGroup;
  users: any[] = [];
  isUpdate = false;
  isModalOpen = false;
  selectedUser: any;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
    this.initForm();
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  openModal(user: any = null) {
    this.isModalOpen = true;
    if (user) {
      this.isUpdate = true;
      this.selectedUser = user;
      this.userForm.setValue({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      });
    } else {
      this.isUpdate = false;
      this.selectedUser = null;
      this.userForm.reset();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isUpdate ? this.updateUser() : this.addUser();
    }
  }

  addUser() {
    const newUser = { ...this.userForm.value, createdAt: new Date().toISOString() };
    this.userService.createUser(newUser).subscribe((user) => {
      this.users.unshift(user); 
      this.closeModal();
      this.sortUsers();  
    });
  }

  updateUser() {
    if (this.selectedUser) {
      const updatedUser = { ...this.userForm.value, createdAt: this.selectedUser.createdAt };
      this.userService.updateUser(this.selectedUser.id, updatedUser).subscribe((user) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = user; 
        }
        this.closeModal();
        this.sortUsers();  
      });
    }
  }


  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter((user) => user.id !== id);
      this.sortUsers(); 
    });
  }

  sortUsers() {
    this.users = this.users.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.userForm.reset();
  }
}
