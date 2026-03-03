import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentsComponent } from '../students.component';

@Component({
  selector: 'app-student-add',
  standalone: true,
  imports: [CommonModule, RouterModule, StudentsComponent],
  template: `<app-students [addOnly]="true"></app-students>`
})
export class StudentAddComponent {}
