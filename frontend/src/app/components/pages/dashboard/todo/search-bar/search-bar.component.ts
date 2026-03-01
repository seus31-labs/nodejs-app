import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs'

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() searchTerm = new EventEmitter<string>()

  query = ''
  private destroy$ = new Subject<void>()
  private term$ = new Subject<string>()

  ngOnInit(): void {
    this.term$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.searchTerm.emit(term))
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onInput(): void {
    this.term$.next(this.query.trim())
  }

  onClear(): void {
    this.query = ''
    this.searchTerm.emit('')
  }
}
