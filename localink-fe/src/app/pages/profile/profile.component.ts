import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user!: UserProfile;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    const userId = 1; // 🔥 TEMP (later from JWT)

    this.userService.getUserProfile(userId).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
      }
    });
  }
}