import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hours',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css']
})
export class HoursComponent {

  businessHoursForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {

    try {

      this.businessHoursForm = this.fb.group(
        {
          open24Hours: [false],
          openTime: ['', Validators.required],
          closeTime: ['', Validators.required]
        },
        { validators: this.timeValidator }
      );

      this.businessHoursForm.get('open24Hours')?.valueChanges.subscribe(value => {

        try {

          const open = this.businessHoursForm.get('openTime');
          const close = this.businessHoursForm.get('closeTime');

          if (value) {

            open?.clearValidators();
            close?.clearValidators();

            open?.disable();
            close?.disable();

            open?.setValue('');
            close?.setValue('');

          } else {

            open?.setValidators(Validators.required);
            close?.setValidators(Validators.required);

            open?.enable();
            close?.enable();

          }

          open?.updateValueAndValidity();
          close?.updateValueAndValidity();

        } catch (error) {
          console.error('Error handling open24Hours change:', error);
        }

      });

    } catch (error) {
      console.error('Error initializing form:', error);
    }

  }

  timeValidator(group: FormGroup) {

    try {

      const open24 = group.get('open24Hours')?.value;
      const open = group.get('openTime')?.value;
      const close = group.get('closeTime')?.value;

      if (open24) return null;

      if (!open || !close) return null;

      return open < close ? null : { invalidTimeRange: true };

    } catch (error) {
      console.error('Error validating time range:', error);
      return null;
    }

  }

  submitHours() {

    try {

      this.submitted = true;

      if (this.businessHoursForm.invalid) {
        return;
      }

      console.log('Business Hours:', this.businessHoursForm.value);

    } catch (error) {
      console.error('Error submitting business hours:', error);
    }

  }

}