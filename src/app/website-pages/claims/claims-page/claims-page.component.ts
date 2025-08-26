import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HomeFormComponent } from "../../home/home-form/home-form.component";

@Component({
  selector: 'app-claims-page',
  imports: [CommonModule, HomeFormComponent],
  templateUrl: './claims-page.component.html',
  styleUrl: './claims-page.component.css'
})
export class ClaimsPageComponent {
  // Current active tab state
  activeTab: 'current' | 'previous' = 'current';

  // Sample claims data - in a real app this would come from a service
  
  // Function to switch tabs
  switchTab(tab: 'current' | 'previous') {
    this.activeTab = tab;
    // In a real app, you would fetch the relevant claims here
  }
}
