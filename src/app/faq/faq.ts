import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  faqs: FaqItem[] = [
    {
      question: 'Is NEXUS GAMING a real store?',
      answer:
        'No. It is a college project that demonstrates how an online gaming store works. Products and prices are sample data.',
    },
    {
      question: 'Can I really buy something here?',
      answer:
        'No. Checkout creates a demo order only. No payment is taken and nothing is delivered.',
    },
    {
      question: 'Do you collect my card or payment details?',
      answer:
        'No. The checkout never asks for card details. Payment is shown as a demo "cash on delivery" step.',
    },
    {
      question: 'Where are my cart, wishlist and orders saved?',
      answer:
        'Only in this browser on this device. Nothing is sent to a server. Clearing your browser data removes them, and they will not appear on another device.',
    },
    {
      question: 'Why can I not log in or create an account?',
      answer:
        'The project has no backend yet, so there is nowhere to store accounts. The Login and Register forms only check your input and then clear it.',
    },
    {
      question: 'How do promo codes work?',
      answer:
        'Open your cart and type one of the demo codes shown there (for example NEXUS10). Each code has a minimum cart value, and the discount is applied to your total and saved with your demo order.',
    },
    {
      question: 'How many of one item can I add to the cart?',
      answer: 'Up to 10 of each product.',
    },
    {
      question: 'Are the product photos and prices real?',
      answer:
        'The photos are for illustration, and the prices in rupees are sample values for the demo.',
    },
  ];
}
