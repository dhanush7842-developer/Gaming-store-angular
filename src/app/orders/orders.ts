import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../services/order.service';
import { InrPipe } from '../shared/inr.pipe';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, DatePipe, InrPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  orders = inject(OrderService);

  itemCount(order: { items: { quantity: number }[] }): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
