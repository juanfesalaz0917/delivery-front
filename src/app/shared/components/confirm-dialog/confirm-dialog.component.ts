import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirm-dialog.component.html",   
  styleUrls: ["./confirm-dialog.component.css"],
})
export class ConfirmDialogComponent {
  @Input() title = "Confirmar acción"
  @Input() message = "¿Estás seguro de realizar esta acción?"
  @Input() confirmText = "Confirmar"
  @Input() cancelText = "Cancelar"
  @Input() type: "danger" | "warning" | "info" = "danger"

  @Output() confirmed = new EventEmitter<void>()
  @Output() cancelled = new EventEmitter<void>()
}
