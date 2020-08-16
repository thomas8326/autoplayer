import { TemplateRef, Component, Input, ElementRef, AfterViewInit, ViewChildren, QueryList, Renderer2, ViewChild, HostListener } from '@angular/core';
import { timer } from 'rxjs';
import { trigger, style, transition, animate } from '@angular/animations';

const HUNDRED_PERCENT = 100;

@Component({
  selector: 'app-slideshow',
  templateUrl: './slide-show.component.html',
  styleUrls: ['./slide-show.component.css'],
  animations: [
    trigger('imageSlide', [
      transition(':enter', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('1s ease', style({
          transform: 'translateX(0%)'
        })),
      ]),
      transition(':leave', [
        style({
          transform: 'translateX(0%)'
        }),
        animate('1s ease', style({
          transform: 'translateX(-100%)'
        }))
      ])
    ]),
  ]
})
export class SlideshowComponent implements AfterViewInit {

  @Input() time = 4000; // s
  @Input() subArrayLength = 1;
  @Input() columnCount = 1;
  @Input() rowCount = 1;
  @Input() height = 200;
  @Input() template: TemplateRef<any>;

  @Input('gallery') set showGallery(list: any[]) {
    this.gallery = this.listToMatrix(list, this.subArrayLength);
  }

  @ViewChild('slideGallery', {static: true}) slideGallery: ElementRef<any>;
  @ViewChildren('slideExhibitionRoom') exhibitionRooms: QueryList<ElementRef>;

  gallery: any[] = [];
  slideIndex = 0;

  windowBlur = false;

  constructor(private readonly renderer: Renderer2) { }

  @HostListener('window:blur')
  blur() {
    this.windowBlur = true;
  }

  @HostListener('window:focus')
  focus() {
    this.windowBlur = false;
  }

  ngAfterViewInit() {
    this.setShowGalleryColumn();
    this.setSlideTime();
  }

  setSlideTime() {
    timer(0, this.time).subscribe(() => {
      if (!this.windowBlur) {
        this.onNext();
      }
    });
  }

  onNext() {
    this.slideNext();
  }

  setShowGalleryColumn() {
    const column = `repeat(${this.gallery.length}, 100%)`;
    const gallery = this.slideGallery.nativeElement;

    this.renderer.setStyle(gallery, 'grid-template-columns', `${column}`);
    this.renderer.setStyle(gallery, 'height', `${this.height}px`);
  }

  setExhibitionRoomsColumnAndRow() {
    const room = this.exhibitionRooms.toArray();
    this.renderer.setStyle(room[0].nativeElement, 'grid-template-rows', this.gridRows());
    this.renderer.setStyle(room[0].nativeElement, 'grid-template-columns', this.gridColumns());
  }

  gridColumns() {
    const columnPercent = HUNDRED_PERCENT / this.columnCount;

    return `repeat(${this.columnCount}, ${columnPercent}%)`;

  }

  gridRows() {
    const rowPercent = HUNDRED_PERCENT / this.rowCount;

    return `repeat(${this.columnCount}, ${rowPercent}%)`;
  }

  slideNext() {
    this.slideIndex++;

    if (this.slideIndex > this.gallery.length - 1) {
      this.slideIndex = 0;
    }
  }

  listToMatrix(list, elementsPerSubArray) {
    const matrix = [];

    for (let i = 0, k = -1; i < list.length; i++) {
      if (i % elementsPerSubArray === 0) {
        k++;
        matrix[k] = [];
      }

      matrix[k].push(list[i]);
    }

    return matrix;
  }
}
