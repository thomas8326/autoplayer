import { Component, AfterViewInit, Input, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { timer } from 'rxjs';

const BUFFER_DISTANCE = 500;

@Component({
  selector: 'app-loop-autoplayer',
  templateUrl: './loop-autoplayer.component.html',
  styleUrls: ['./loop-autoplayer.component.scss']
})
export class LoopAutoplayerComponent implements AfterViewInit, OnDestroy {

  @Input('left') set setDirection(direction: string) {
    // TODO right behavior;
    this.direction = direction === 'left' ? -1 : 1;
  }

  @Input() isokineticMotionTime = 15; // μs
  @Input() movingDistance = 1;

  @ViewChild('autoPlayer', {static: true}) autoPlayer: ElementRef<any>;
  @ViewChild('container', {static: true}) container: ElementRef<any>;
  @ViewChild('content', {static: true}) content: ElementRef<any>;

  direction = -1;
  autoPlayerLeftPos: number;

  constructor(private readonly renderer: Renderer2) { }

  addNode(elementRightPos: number, containerWidth: number) {
    if (elementRightPos <= containerWidth + BUFFER_DISTANCE) {
      const content = this.content.nativeElement.cloneNode(true);
      this.renderer.appendChild(this.autoPlayer.nativeElement, content);
    }
  }

  autoLoop() {
    timer(0, this.isokineticMotionTime).pipe(
    ).subscribe(() => {
      const containerWidth = this.container.nativeElement.offsetWidth;
      if (containerWidth === 0) {
        return;
      }

      const autoPlayerWidth = this.autoPlayer.nativeElement.offsetWidth;
      const autoPlayerRightPos = this.autoPlayerLeftPos + autoPlayerWidth;

      this.setAutoPlayerLeftBoundary(this.autoPlayerLeftPos, this.movingDistance * this.direction);
      this.removeNode(this.autoPlayerLeftPos);
      this.addNode(autoPlayerRightPos, containerWidth);
    });
  }

  init() {
    // keep the clientLeft to know the last left position.
    this.autoPlayerLeftPos = this.autoPlayer.nativeElement.clientLeft;
  }

  ngAfterViewInit() {
    this.init();
    this.autoLoop();
  }

  ngOnDestroy() {
    // untilComponentDestroyed
  }

  removeNode(parentLeftPos: number) {
    const parentNode = this.autoPlayer.nativeElement;

    const childNode = parentNode.childNodes[0];
    const childRightPos = parentLeftPos + childNode.offsetLeft + childNode.offsetWidth;

    const containerViewLeftPos = this.container.nativeElement.offsetLeft - BUFFER_DISTANCE;

    if (childRightPos <= containerViewLeftPos) {
      this.setAutoPlayerLeftBoundary(parentLeftPos, childNode.offsetWidth);
      this.renderer.removeChild(parentNode, childNode);
    }
  }

  setAutoPlayerLeftBoundary(leftPos: number, movingDistance: number) {
    this.autoPlayerLeftPos = leftPos + movingDistance;
    this.renderer.setStyle(this.autoPlayer.nativeElement, 'left', `${this.autoPlayerLeftPos}px`);
  }

}
