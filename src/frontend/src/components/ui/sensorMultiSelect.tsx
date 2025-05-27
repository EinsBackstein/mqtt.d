'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

type Option = {
  value: string;
  label: string;
};

type SensorMultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  id?: string;
  className?: string;
};

export function SensorMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Sensoren auswählen',
  id,
  className,
}: SensorMultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleUnselect = (sensorId: string) => {
    onChange(selected.filter((s) => s !== sensorId));
  };

  const selectables = options.filter((option) => !selected.includes(option.value));

  return (
    <Command className={`overflow-visible ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring bg-input/30 focus-within:ring-offset-2 border border-input ${className || ''}`}>
      <div className="group px-3 py-2 text-xs">
        <div className="w-full">
          <div className="flex flex-wrap gap-1">
            {selected.map((sensorId) => {
              const option = options.find((o) => o.value === sensorId);
              return (
                <Badge key={sensorId} variant="secondary">
                  {option?.label || sensorId}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(sensorId);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(sensorId)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 placeholder:text-xs"
            id={id}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full mt-3 z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandEmpty>Keine Sensoren gefunden.</CommandEmpty>
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue('');
                      onChange([...selected, option.value]);
                    }}
                    className={'cursor-pointer'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onChange([...selected, option.value]);
                        setInputValue('');
                      }
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  );
}