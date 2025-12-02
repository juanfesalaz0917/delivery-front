import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CustomersService } from '../../../core/services/customers.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customers-form.component.html',
})
export class CustomersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customersService = inject(CustomersService);
  private readonly notificationService = inject(NotificationService);

  form!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  customerId: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.customerId = +id;
      this.loadCustomer(this.customerId);
    }
  }

  private loadCustomer(id: number): void {
    this.loading.set(true);
    this.customersService.getById(id).subscribe({
      next: (customer) => {
        this.form.patchValue(customer);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar cliente');
        this.router.navigate(['/customers']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const data = this.form.value;

    const request = this.isEditMode()
      ? this.customersService.update(this.customerId!, data)
      : this.customersService.create(data);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode()
            ? 'Cliente actualizado correctamente'
            : 'Cliente creado correctamente',
        );
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.notificationService.error('Error al guardar cliente');
        this.loading.set(false);
      },
    });
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return control ? control.hasError(error) && control.touched : false;
  }
}
