import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  // Clean modern SVG placeholder for products without images or with broken URLs
  @Input() appImageFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f1f5f9"><rect width="400" height="300" fill="%23f1f5f9"/><g fill="%2394a3b8" transform="translate(160, 110)"><path d="M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 68c-15.5 0-28-12.5-28-28s12.5-28 28-28 28 12.5 28 28-12.5 28-28 28z"/><path d="M52 26h-24c-3.3 0-6 2.7-6 6v16c0 3.3 2.7 6 6 6h24c3.3 0 6-2.7 6-6V32c0-3.3-2.7-6-6-6zm-18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm20 18H26l7-9 5 6 4-5 8 8z"/></g><text x="200" y="210" fill="%2394a3b8" font-family="-apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">No Image Available</text></svg>`;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    const img = this.el.nativeElement;
    if (img.src !== this.appImageFallback) {
      img.src = this.appImageFallback;
    }
  }
}
