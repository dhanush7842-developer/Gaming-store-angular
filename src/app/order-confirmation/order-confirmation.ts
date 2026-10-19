import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OrderService } from '../services/order.service';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, DatePipe, InrPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
})
export class OrderConfirmation {
  private route = inject(ActivatedRoute);
  orders = inject(OrderService);

  // The order id comes from the URL: /order-confirmation/NX-20261018-4F7K
  private id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  order = computed(() => this.orders.getById(this.id()));
}
