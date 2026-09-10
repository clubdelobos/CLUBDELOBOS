"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "@base-ui/react/select";

export interface AdminSelectOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Palette-aware dropdown for the admin panel, replacing the unstyled native
 * `<select>` (see the Categoría / Subcategoría fields in ToursManager). Built
 * on Base UI's Select primitive; styles live under `.admin-select-*` in
 * globals.css.
 */
export function AdminSelect<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  id,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly AdminSelectOption<T>[];
  ariaLabel?: string;
  id?: string;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      items={options.map((option) => ({ value: option.value, label: option.label }))}
    >
      <Select.Trigger id={id} aria-label={ariaLabel} className="admin-select-trigger admin-input h-10 px-3">
        <Select.Value className="admin-select-value" />
        <Select.Icon className="admin-select-caret">
          <ChevronDown className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="admin-select-positioner"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          <Select.Popup className="admin-select-popup">
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className="admin-select-item">
                  <Select.ItemText className="admin-select-item-text">{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="admin-select-item-check">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
