import { Directive, HostListener, ElementRef, inject } from '@angular/core';

// A simple dark placeholder image (inline SVG, so no extra file is needed).
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#151A2B"/>' +
      '<text x="200" y="155" fill="#94A3B8" font-family="Arial" font-size="18" text-anchor="middle">Image unavailable</text>' +
      '</svg>',
  );

/** Usage: <img appImgFallback [src]="..." alt="..."> - shows a placeholder if the image fails to load. */
@Directive({
  selector: 'img[appImgFallback]',
})
export class ImgFallback {
  private img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  @HostListener('error')
  onError() {
    // Avoid an infinite loop if the placeholder itself fails
    if (this.img.src !== PLACEHOLDER) {
      this.img.src = PLACEHOLDER;
    }
  }
}
