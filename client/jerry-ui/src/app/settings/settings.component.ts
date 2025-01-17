import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { SettingsService } from '../services/settings.service';

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
    MatOptionModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  strategies = ['The Sir Kabzin (default)', 'The Sir Kabzin (modified)', 'The Sir Kabzin (advanced)'];

  constructor(private fb: FormBuilder, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      strategy: ['', Validators.required],
      enabledIndicators: [{ value: '', disabled: true }],
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
      this.settingsService.updateSettings(this.settingsForm.value).subscribe(response => {
        console.log('Configuration updated', response);
      });
    }
  }
}