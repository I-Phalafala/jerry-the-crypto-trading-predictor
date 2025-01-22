import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SettingsService } from '../services/settings.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Output() settingsSaved = new EventEmitter<void>(); // Add this line
  @Output() close = new EventEmitter<void>(); // Add this line
  settingsForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
    ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      strategy: ['', Validators.required],
      enabledIndicators: ['', Validators.required],
      shortPeriod: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      longPeriod: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      rsiPeriod: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      rsiOverbought: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      rsiOversold: ['', [Validators.required, Validators.min(1), Validators.max(100)]]
    });

    this.settingsService.getSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      this.settingsService.updateSettings(this.settingsForm.value).subscribe({
        next: response => {
          console.log('Configuration updated', response);
          this.snackBar.open('Configuration updated successfully', 'Close', {
            duration: 3000,
          });
          this.settingsSaved.emit(); // Emit the event here
        },
        error: error => {
          console.error('Error updating configuration', error);
          this.snackBar.open('Error updating configuration', 'Close', {
            duration: 3000,
          });
        }
      });
    }
  }

  onClose(): void {
    this.close.emit(); // Emit the close event
  }
}