'use client';

import { useRouter } from 'next/navigation';

export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  label,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  const router = useRouter();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(window.location.search);
    if (event.target.value) {
      params.set(name, event.target.value);
      params.delete('page');
    } else {
      params.delete(name);
    }
    const qs = params.toString();
    router.push(qs ? `/courses?${qs}` : '/courses');
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        name={name}
        value={defaultValue}
        onChange={onChange}
        className="focus-ring rounded-md border border-border bg-card px-3 py-2 text-sm font-medium"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}