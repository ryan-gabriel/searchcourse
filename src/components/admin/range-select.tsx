import { buttonClass } from '@/components/button';

const RANGE_OPTIONS = [
  { value: '', label: 'All time' },
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export function RangeSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="get" action="/admin/analytics" className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="range" className="mb-1 block text-sm font-medium">
          Range
        </label>
        <select
          id="range"
          name="range"
          defaultValue={defaultValue}
          className="focus-ring rounded-md border border-border bg-card px-4 py-2 text-sm"
        >
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonClass('secondary')}>
        Apply
      </button>
    </form>
  );
}