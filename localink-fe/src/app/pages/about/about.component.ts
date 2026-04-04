import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  team = [
    { name: 'Alice Johnson', role: 'Founder & CEO', img: '/assets/images/team/ceo.jpg', initial: 'A' },
    { name: 'Raj Patel', role: 'CTO', img: '/assets/images/team/cto.jpg', initial: 'R' },
    { name: 'Maria Chen', role: 'Head of Product', img: '/assets/images/team/product.jpg', initial: 'M' },
    { name: 'David Kim', role: 'Lead Developer', img: '/assets/images/team/dev-lead.jpg', initial: 'D' },
    { name: 'Priya Sharma', role: 'UX Designer', img: '/assets/images/team/designer.jpg', initial: 'P' },
    { name: 'James Wilson', role: 'Accessibility Lead', img: '/assets/images/team/accessibility.jpg', initial: 'J' }
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
 