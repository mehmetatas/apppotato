import type { ComponentChildren } from "preact";

type FilterOption<T extends string> = {
  value: T;
  label: string;
  icon?: ComponentChildren;
};

type FilterPillsProps<T extends string> = {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
};

export const FilterPills = <T extends string>({
  options,
  selected,
  onSelect,
}: FilterPillsProps<T>) => {
  return (
    <div class="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          class={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
            selected === option.value
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};
