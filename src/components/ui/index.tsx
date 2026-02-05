/**
 * ChrisLO Admin - UI Component Library
 * A comprehensive set of reusable, accessible components
 */

import React, { forwardRef, createContext, useContext, useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, AlertCircle, AlertTriangle, CheckCircle, Info, Loader2, Search, ChevronRight, ChevronLeft } from 'lucide-react';

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// ============================================
// BUTTON COMPONENT
// ============================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
    };

    const sizes = {
      xs: 'btn-xs',
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    return (
      <button
        ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ============================================
// ICON BUTTON COMPONENT
// ============================================
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'md', icon, label, ...props }, ref) => {
    const sizes = {
      sm: 'icon-btn-sm',
      md: 'icon-btn-md',
      lg: 'w-12 h-12',
    };

    const variants = {
      default: 'icon-btn',
      ghost: 'icon-btn',
      outline: 'icon-btn border border-slate-200',
    };

    return (
      <button
        ref={ref}
        className={cn(variants[variant], sizes[size], className)}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

// ============================================
// INPUT COMPONENT
// ============================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {leftIcon && (
          <div className="input-icon input-icon-left">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            leftIcon && 'input-with-icon-left',
            rightIcon && 'input-with-icon-right',
            error && 'input-error',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="input-icon input-icon-right">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================
// SEARCH INPUT COMPONENT
// ============================================
export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={className}
        leftIcon={<Search size={18} />}
        rightIcon={
          value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          ) : undefined
        }
        value={value}
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

// ============================================
// TEXTAREA COMPONENT
// ============================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn('textarea', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10', className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

// ============================================
// SELECT COMPONENT
// ============================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn('select', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10', className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options ? options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )) : children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// ============================================
// LABEL COMPONENT
// ============================================
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn('label', className)} {...props}>
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

// ============================================
// FORM FIELD COMPONENT
// ============================================
export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, hint, required, children }) => {
  return (
    <div className="space-y-1.5">
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="error-text">{error}</p>}
      {hint && !error && <p className="helper-text">{hint}</p>}
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  leftIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'neutral', 
  size = 'md',
  dot, 
  leftIcon,
  children, 
  ...props 
}) => {
  const variants = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  const dotColors = {
    neutral: 'bg-slate-500',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: '',
  };

  return (
    <span className={cn('badge', variants[variant], sizeClasses[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {leftIcon}
      {children}
    </span>
  );
};

// ============================================
// CARD COMPONENT
// ============================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          hoverable && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card-header', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card-body', className)} {...props} />
  )
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('card-footer', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// ============================================
// MODAL COMPONENT
// ============================================
interface ModalContextValue {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, size = 'md', children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl',
    '2xl': 'modal-2xl',
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="modal-backdrop" onClick={onClose}>
        <div 
          role="dialog" 
          aria-modal="true" 
          className={cn('modal', sizes[size])} 
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(ModalContext);
  return (
    <div className={cn('modal-header', className)}>
      <h3 className="text-lg font-semibold text-slate-900">{children}</h3>
      {context && (
        <button
          onClick={context.onClose}
          className="icon-btn icon-btn-sm text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('modal-body', className)}>{children}</div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('modal-footer', className)}>{children}</div>
);

// ============================================
// ALERT COMPONENT
// ============================================
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ className, variant = 'info', title, onClose, children, ...props }) => {
  const variants = {
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
    info: 'alert-info',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={cn('alert', variants[variant], className)} role="alert" {...props}>
      <div className="shrink-0">{icons[variant]}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// ============================================
// AVATAR COMPONENT
// ============================================
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ className, src, alt, name, size = 'md', ...props }) => {
  const sizes = {
    xs: 'avatar-xs',
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('avatar', sizes[size], className)} {...props}>
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : name ? (
        getInitials(name)
      ) : (
        '?'
      )}
    </div>
  );
};

// ============================================
// TABLE COMPONENT
// ============================================
export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, keyExtractor, loading, emptyMessage = 'No data found', onRowClick }: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="skeleton skeleton-text w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="empty-state">
          <p className="text-slate-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={col.className}>
                  {col.render ? col.render(item, index) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="empty-state">
    {icon && <div className="empty-state-icon">{icon}</div>}
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-description">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============================================
// SKELETON COMPONENT
// ============================================
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'heading' | 'avatar' | 'rect';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect', width, height, style, ...props }) => {
  const variants = {
    text: 'skeleton skeleton-text',
    heading: 'skeleton skeleton-heading',
    avatar: 'skeleton skeleton-avatar',
    rect: 'skeleton',
  };

  return (
    <div
      className={cn(variants[variant], className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; isPositive: boolean };
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, iconBg = 'bg-indigo-50', iconColor = 'text-indigo-600' }) => (
  <Card className="stat-card">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
        {trend && (
          <p className={cn('stat-trend', trend.isPositive ? 'stat-trend-up' : 'stat-trend-down')}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      {icon && (
        <div className={cn('p-2.5 rounded-xl', iconBg, iconColor)}>
          {icon}
        </div>
      )}
    </div>
  </Card>
);

// ============================================
// TABS COMPONENT
// ============================================
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => (
  <div className={cn('tabs', className)}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn('tab', activeTab === tab.id && 'tab-active')}
      >
        {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn(
            'ml-2 px-1.5 py-0.5 text-xs rounded-full',
            activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
          )}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ============================================
// DROPDOWN MENU COMPONENT
// ============================================
export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={cn('dropdown-menu', align === 'left' ? 'left-0' : 'right-0', 'top-full mt-1')}>
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="dropdown-divider" />
            ) : (
              <button
                key={index}
                className={cn('dropdown-item w-full text-left', item.danger && 'dropdown-item-danger')}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingFrom?: number;
  showingTo?: number;
  total?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showingFrom,
  showingTo,
  total,
}) => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      {showingFrom !== undefined && showingTo !== undefined && total !== undefined && (
        <p className="text-sm text-slate-600">
          Showing <span className="font-medium">{showingFrom}</span> to{' '}
          <span className="font-medium">{showingTo}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </p>
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>
        {start > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(1)}>1</Button>
            {start > 2 && <span className="px-2 text-slate-400">...</span>}
          </>
        )}
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
            <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

// ============================================
// CHECKBOX COMPONENT
// ============================================
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn('checkbox', className)}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm text-slate-700 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ============================================
// TOGGLE COMPONENT
// ============================================
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('toggle', checked ? 'toggle-checked' : 'toggle-unchecked', disabled && 'opacity-50 cursor-not-allowed')}
    >
      <span className={cn('toggle-thumb', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
    {label && <span className="text-sm text-slate-700">{label}</span>}
  </div>
);

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-indigo-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    error: 'bg-red-600',
  };

  return (
    <div className="w-full">
      <div className={cn('progress', sizes[size])}>
        <div
          className={cn('progress-bar', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-500 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};

// ============================================
// BREADCRUMB COMPONENT
// ============================================
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav className="breadcrumb" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
        {index === items.length - 1 ? (
          <span className="breadcrumb-current">{item.label}</span>
        ) : item.href ? (
          <a href={item.href} className="breadcrumb-link">{item.label}</a>
        ) : (
          <button onClick={item.onClick} className="breadcrumb-link">{item.label}</button>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ============================================
// DIVIDER COMPONENT
// ============================================
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className }) => (
  <div className={cn(orientation === 'horizontal' ? 'divider' : 'divider-vertical', className)} />
);

// ============================================
// SPINNER COMPONENT
// ============================================
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return <Loader2 className={cn('animate-spin text-indigo-600', sizes[size], className)} />;
};

// ============================================
// PAGE HEADER COMPONENT
// ============================================
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, breadcrumb }) => (
  <div className="page-header">
    {breadcrumb && <Breadcrumb items={breadcrumb} />}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  </div>
);
