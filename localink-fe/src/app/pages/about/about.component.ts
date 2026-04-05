import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  team = [
    { name: 'Prem Kumar', img: '/assets/images/team/ceo.jpg', initial: 'A' },
    { name: 'Anurag', img: '/assets/images/team/2.jpeg', initial: 'R' },
    { name: 'Harshini Sai', img: '/assets/images/team/product.jpg', initial: 'M' },
    { name: 'Aadarsh Reddy Depa', img: '/assets/images/team/4.jpeg', initial: 'D' },
    { name: 'Sai Sankeerth', img: '/assets/images/team/image.png', initial: 'P' },
    { name: 'Sai Chandrashekar', img: '/assets/images/team/6.jpg', initial: 'J' }
  ];

  features = [
    { icon: '🔍', title: 'Smart Search', description: 'Find businesses quickly with intelligent search' },
    { icon: '🌐', title: 'Multilingual', description: 'Available in multiple Indian languages' },
    { icon: '🎙️', title: 'Voice Enabled', description: 'Search using your voice' },
    { icon: '📍', title: 'Location Based', description: 'Find nearby businesses with ease' },
    { icon: '⭐', title: 'Favorites', description: 'Save your favorite businesses' }
  ];

  differentiators = [
    { icon: '♿', title: 'Accessibility First', description: 'Designed for everyone including visually impaired users' },
    { icon: '🇮🇳', title: 'India Focus', description: 'Built specifically for Indian businesses and consumers' },
    { icon: '💡', title: 'User Centric', description: 'Simple and intuitive interface' }
  ];

  onImageError(imgElement: HTMLImageElement): void {
    imgElement.style.display = 'none';
  }
}