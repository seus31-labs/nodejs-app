import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormControl } from '@angular/forms'
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs'

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private static readonly HISTORY_STORAGE_KEY = 'todo.search.history.v1'
  private static readonly HISTORY_LIMIT = 10

  @Output() searchTerm = new EventEmitter<string>()
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>

  query = new FormControl('', { nonNullable: true })
  history: string[] = []
  isHistoryOpen = false
  private destroy$ = new Subject<void>()

  ngOnInit(): void {
    this.loadHistory()

    this.query.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        const term = (value ?? '').trim()
        this.searchTerm.emit(term)
        if (term) this.saveHistory(term)
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onClear(): void {
    this.query.setValue('')
    this.searchTerm.emit('')
  }

  focus(): void {
    this.searchInputRef?.nativeElement?.focus()
  }

  onFocus(): void {
    this.isHistoryOpen = true
  }

  onBlur(): void {
    setTimeout(() => {
      this.isHistoryOpen = false
    }, 150)
  }

  get filteredHistory(): string[] {
    const q = (this.query.value ?? '').trim().toLowerCase()
    const list = q ? this.history.filter((h) => h.toLowerCase().includes(q)) : this.history
    return list.slice(0, 8)
  }

  selectHistory(term: string): void {
    this.query.setValue(term)
    this.searchTerm.emit(term)
    this.saveHistory(term)
    this.isHistoryOpen = false
  }

  clearHistory(): void {
    this.history = []
    this.persistHistory([])
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(SearchBarComponent.HISTORY_STORAGE_KEY)
      if (!raw) {
        this.history = []
        return
      }
      const parsed = JSON.parse(raw)
      this.history = Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string' && v.trim()).slice(0, SearchBarComponent.HISTORY_LIMIT) : []
    } catch {
      this.history = []
    }
  }

  private saveHistory(term: string): void {
    const normalized = term.trim()
    if (!normalized) return

    const next = [normalized, ...this.history.filter((h) => h !== normalized)].slice(0, SearchBarComponent.HISTORY_LIMIT)
    this.history = next
    this.persistHistory(next)
  }

  private persistHistory(items: string[]): void {
    try {
      localStorage.setItem(SearchBarComponent.HISTORY_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore (storage full / disabled)
    }
  }
}
