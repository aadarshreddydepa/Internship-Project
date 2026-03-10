import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { BusinessService } from '../../services/business.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('AdminDashboardComponent', () => {

let component: AdminDashboardComponent;
let fixture: ComponentFixture<AdminDashboardComponent>;
let service: BusinessService;

beforeEach(async () => {

await TestBed.configureTestingModule({

imports: [
AdminDashboardComponent,
FormsModule,
CommonModule
],

providers: [BusinessService]

}).compileComponents();

fixture = TestBed.createComponent(AdminDashboardComponent);
component = fixture.componentInstance;
service = TestBed.inject(BusinessService);

fixture.detectChanges();

});


it('TC01: should create admin dashboard component', () => {

expect(component).toBeTruthy();

});


it('TC02: should load businesses', () => {

component.loadBusinesses();

expect(component.allBusinesses.length).toBeGreaterThan(0);

});


it('TC03: should approve business', () => {

component.approve(1);

const business = component.allBusinesses.find(b => b.id === 1);

expect(business?.status).toBe('approved');

});


it('TC04: should reject business', () => {

component.reject(2);

const business = component.allBusinesses.find(b => b.id === 2);

expect(business?.status).toBe('rejected');

});


it('TC05: should deactivate business', () => {

component.deactivate(1);

const business = component.allBusinesses.find(b => b.id === 1);

expect(business?.status).toBe('inactive');

});


it('TC06: should filter businesses by search', () => {

component.searchTerm = 'clinic';

component.filterBusinesses();

expect(component.filteredBusinesses.length).toBeGreaterThan(0);

});

});