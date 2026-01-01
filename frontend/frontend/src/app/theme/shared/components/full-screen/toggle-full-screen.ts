import { Directive, ElementRef, HostListener } from '@angular/core'

import screenfull from 'screenfull'

@Directive({
  standalone: true,
  selector: '[appToggleFullScreen]'
})
export class ToggleFullScreenDirective {
  // Constructor
  constructor(private elements: ElementRef) {}

  // public method
  @HostListener('click')
  onClick() {
    if (screenfull.isEnabled) {
      this.elements.nativeElement.querySelector('.feather').classList.toggle('icon-maximize')
      this.elements.nativeElement.querySelector('.feather').classList.toggle('icon-minimize')
      screenfull.toggle()
    }

    if (isScreenFull(screenfull)) {
      if (screenfull.isFullscreen) {
        screenfull.exit()
      } else {
        screenfull.request()
      }
    }
  }
}

function isScreenFull(sf: any): any {
  return sf.isFullscreen
}
