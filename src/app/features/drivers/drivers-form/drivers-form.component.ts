import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DriverService } from '../../../core/services/driver.service';
import type { Driver } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drivers-form.component.html',
})
export class DriverFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly driverService = inject(DriverService);
  private readonly notificationService = inject(NotificationService);

  driverForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  driverId: string | null = null;

  licenseTypes = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  statusOptions: Driver['status'][] = ['active', 'inactive', 'suspended'];

  ngOnInit(): void {
    this.initForm();
    this.driverId = this.route.snapshot.paramMap.get('id');
    
    if (this.driverId) {
      this.isEditMode.set(true);
      this.loadDriver(this.driverId);
    }
  }

  initForm(): void {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      license_number: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  loadDriver(id: string): void {
    this.loading.set(true);
    this.driverService.getById(id).subscribe({
      next: (driver) => {
        this.driverForm.patchValue({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          license_number: driver.license_number,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar el conductor');
        this.loading.set(false);
        this.router.navigate(['/drivers']);
      },
    });
  }

  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const driverData: Driver = this.driverForm.value;

    const request = this.isEditMode() && this.driverId
      ? this.driverService.update(this.driverId, driverData)
      : this.driverService.create(driverData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() 
            ? 'Conductor actualizado correctamente'
            : 'Conductor creado correctamente'
        );
        this.router.navigate(['/drivers']);
      },
      error: () => {
        this.notificationService.error(
          this.isEditMode()
            ? 'Error al actualizar el conductor'
            : 'Error al crear el conductor'
        );
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/drivers']);
  }

  getFieldError(fieldName: string): string {
    const field = this.driverForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field?.hasError('pattern')) return 'Formato inválido (10 dígitos)';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.driverForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return labels[status] || status;
  }
}