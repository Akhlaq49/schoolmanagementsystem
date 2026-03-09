import {
  Component, Input, Output, EventEmitter, forwardRef,
  ElementRef, HostListener, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export interface DropdownOption {
  value: any;
  label: string;
  sublabel?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }],
  template: `
    <div class="dd" [class.dd-open]="open" [class.dd-disabled]="disabled" [class.dd-sm]="size === 'sm'">
      <button type="button" class="dd-trigger" (click)="toggle()" [disabled]="disabled">
        <span class="dd-selected" [class.dd-placeholder]="!hasSelection()">
          <i *ngIf="selectedOption?.icon" [class]="selectedOption!.icon" class="dd-sel-icon"></i>
          {{ hasSelection() ? selectedOption?.label : placeholder }}
        </span>
        <i class="fa fa-chevron-down dd-arrow" [class.dd-arrow-up]="open"></i>
      </button>

      <div class="dd-panel" *ngIf="open">
        <div class="dd-search-wrap" *ngIf="searchable && flatOptions.length > 6">
          <i class="fa fa-search dd-search-icon"></i>
          <input class="dd-search" type="text" [placeholder]="searchPlaceholder"
                 [(ngModel)]="searchTerm" (input)="filterOptions()" (click)="$event.stopPropagation()">
        </div>

        <ul class="dd-list" role="listbox">
          <li class="dd-item dd-item-placeholder"
              *ngIf="showPlaceholderOption"
              [class.dd-active]="!hasSelection()"
              (click)="selectValue(placeholderValue)"
              role="option">
            {{ placeholder }}
          </li>
          <li class="dd-item"
              *ngFor="let opt of visibleOptions; trackBy: trackByValue"
              [class.dd-active]="isSelected(opt)"
              [class.dd-disabled-opt]="opt.disabled"
              (click)="!opt.disabled && selectValue(opt.value)"
              role="option">
            <i *ngIf="opt.icon" [class]="opt.icon" class="dd-opt-icon"></i>
            <div class="dd-opt-text">
              <span class="dd-opt-label">{{ opt.label }}</span>
              <span class="dd-opt-sub" *ngIf="opt.sublabel">{{ opt.sublabel }}</span>
            </div>
            <i class="fa fa-check dd-check" *ngIf="isSelected(opt)"></i>
          </li>
          <li class="dd-empty" *ngIf="visibleOptions.length === 0">
            <i class="fa fa-inbox"></i> No options found
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

    .dd { position: relative; }

    .dd-trigger {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; padding: 0.65rem 1rem; background: #fff;
      border: 1.5px solid #d1d9e6; border-radius: 0.625rem;
      font-size: 0.9rem; font-weight: 500; color: #1a2e44;
      cursor: pointer; transition: all 0.25s ease;
      text-align: left; min-height: 42px;
      box-shadow: 0 1px 3px rgba(15,39,68,0.04);
    }
    .dd-trigger:hover { border-color: #8aa8c4; box-shadow: 0 2px 8px rgba(15,39,68,0.08); }
    .dd-trigger:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.1); }
    .dd-open .dd-trigger {
      border-color: #1e3a5f; box-shadow: 0 0 0 3px rgba(30,58,95,0.1);
      border-radius: 0.625rem 0.625rem 0 0;
    }
    .dd-disabled .dd-trigger { background: #f4f6f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; box-shadow: none; }

    .dd-selected { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 0.5rem; }
    .dd-placeholder { color: #94a3b8; font-weight: 400; }
    .dd-sel-icon { font-size: 0.85rem; color: #5b7d9e; }

    .dd-arrow {
      font-size: 0.65rem; color: #8aa8c4; transition: transform 0.3s cubic-bezier(.4,0,.2,1); flex-shrink: 0;
      width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: #f0f4fa;
    }
    .dd-open .dd-arrow { background: #1e3a5f; color: #fff; }
    .dd-arrow-up { transform: rotate(180deg); }

    .dd-panel {
      position: absolute; top: 100%; left: 0; right: 0;
      background: #fff; border: 1.5px solid #1e3a5f;
      border-top: 1px solid #e8edf3;
      border-radius: 0 0 0.625rem 0.625rem;
      box-shadow: 0 12px 40px rgba(15,39,68,0.16), 0 4px 12px rgba(15,39,68,0.08);
      z-index: 999; max-height: 280px; display: flex; flex-direction: column;
      animation: ddSlide 0.2s cubic-bezier(.4,0,.2,1);
    }
    @keyframes ddSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .dd-search-wrap {
      position: relative; padding: 0.5rem 0.6rem; border-bottom: 1px solid #eef2f7; background: #fafbfd;
    }
    .dd-search-icon {
      position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%);
      color: #8aa8c4; font-size: 0.78rem;
    }
    .dd-search {
      width: 100%; padding: 0.45rem 0.65rem 0.45rem 1.9rem;
      border: 1.5px solid #dde4ed; border-radius: 0.45rem;
      font-size: 0.85rem; color: #1a2e44; background: #fff;
      transition: all 0.2s; box-sizing: border-box;
    }
    .dd-search:focus { outline: none; border-color: #1e3a5f; box-shadow: 0 0 0 2px rgba(30,58,95,0.08); }
    .dd-search::placeholder { color: #a0b0c0; }

    .dd-list {
      list-style: none; margin: 0; padding: 0.3rem 0;
      overflow-y: auto; overscroll-behavior: contain;
    }
    .dd-list::-webkit-scrollbar { width: 5px; }
    .dd-list::-webkit-scrollbar-track { background: transparent; }
    .dd-list::-webkit-scrollbar-thumb { background: #d0d9e4; border-radius: 3px; }
    .dd-list::-webkit-scrollbar-thumb:hover { background: #a0b4c8; }

    .dd-item {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.55rem 0.85rem; cursor: pointer; margin: 0 0.35rem; border-radius: 0.4rem;
      transition: all 0.15s ease; font-size: 0.9rem; color: #3a4f65;
    }
    .dd-item:hover { background: linear-gradient(135deg, #eef3fa 0%, #f4f7fc 100%); color: #1a2e44; }
    .dd-item.dd-active {
      background: linear-gradient(135deg, rgba(30,58,95,0.1) 0%, rgba(30,58,95,0.05) 100%);
      color: #1e3a5f; font-weight: 600;
    }
    .dd-item.dd-active .dd-opt-icon { color: #1e3a5f; }
    .dd-item-placeholder { color: #94a3b8; font-style: italic; font-size: 0.85rem; }
    .dd-disabled-opt { opacity: 0.4; cursor: not-allowed; }
    .dd-disabled-opt:hover { background: transparent; }

    .dd-opt-icon {
      font-size: 0.85rem; color: #6a8cad; width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; border-radius: 4px; background: rgba(106,140,173,0.08);
    }
    .dd-opt-text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .dd-opt-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.4; }
    .dd-opt-sub { font-size: 0.75rem; color: #8aa8c4; margin-top: 0.1rem; line-height: 1.3; }

    .dd-check {
      margin-left: auto; font-size: 0.65rem; flex-shrink: 0;
      width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      background: #1e3a5f; color: #fff; border-radius: 50%;
    }

    .dd-empty {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 1.5rem; color: #94a3b8; font-size: 0.85rem; font-style: italic;
    }
    .dd-empty i { font-size: 1.1rem; }

    /* ─── Size: sm ──────────────────────────────────── */
    .dd-sm .dd-trigger { padding: 0.4rem 0.7rem; font-size: 0.835rem; min-height: 34px; border-radius: 0.45rem; }
    .dd-sm.dd-open .dd-trigger { border-radius: 0.45rem 0.45rem 0 0; }
    .dd-sm .dd-panel { border-radius: 0 0 0.45rem 0.45rem; }
    .dd-sm .dd-item { padding: 0.4rem 0.7rem; font-size: 0.835rem; }
    .dd-sm .dd-arrow { width: 16px; height: 16px; font-size: 0.6rem; }
  `]
})
export class DropdownComponent implements ControlValueAccessor, OnChanges {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() disabled = false;
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() showPlaceholderOption = true;
  @Input() placeholderValue: any = null;
  @Input() size: 'default' | 'sm' = 'default';

  @Output() changed = new EventEmitter<any>();

  open = false;
  searchTerm = '';
  flatOptions: DropdownOption[] = [];
  visibleOptions: DropdownOption[] = [];
  selectedOption: DropdownOption | null = null;

  private innerValue: any = null;
  private onChangeFn: (v: any) => void = () => {};
  private onTouchedFn: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.flatOptions = this.options || [];
      this.filterOptions();
      this.syncSelected();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.close(); }

  toggle() {
    if (this.disabled) return;
    this.open ? this.close() : this.openPanel();
  }

  openPanel() {
    this.open = true;
    this.searchTerm = '';
    this.filterOptions();
  }

  close() {
    if (this.open) {
      this.open = false;
      this.onTouchedFn();
    }
  }

  selectValue(val: any) {
    this.innerValue = val;
    this.syncSelected();
    this.onChangeFn(val);
    this.changed.emit(val);
    this.close();
  }

  isSelected(opt: DropdownOption): boolean {
    return this.innerValue === opt.value;
  }

  hasSelection(): boolean {
    return this.innerValue !== null && this.innerValue !== undefined && this.innerValue !== this.placeholderValue;
  }

  filterOptions() {
    if (!this.searchTerm.trim()) {
      this.visibleOptions = [...this.flatOptions];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.visibleOptions = this.flatOptions.filter(o =>
        o.label.toLowerCase().includes(term) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(term))
      );
    }
  }

  trackByValue(_: number, opt: DropdownOption) {
    return opt.value;
  }

  private syncSelected() {
    this.selectedOption = this.flatOptions.find(o => o.value === this.innerValue) || null;
  }

  // ─── ControlValueAccessor ─────────────────────────

  writeValue(val: any) {
    this.innerValue = val;
    this.syncSelected();
  }

  registerOnChange(fn: any) { this.onChangeFn = fn; }
  registerOnTouched(fn: any) { this.onTouchedFn = fn; }
  setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }
}
