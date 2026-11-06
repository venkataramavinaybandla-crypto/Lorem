import type { ReactNode } from 'react';
import CodeBlock from './CodeBlock';

interface GenericBlockProps {
  label: string;
  value: unknown;
}

function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function formatPrimitive(value: string | number | boolean): string {
  return typeof value === 'string' ? value : String(value);
}

/**
 * Fallback renderer for any YAML field that has no dedicated component.
 * Renders a titled block containing text or code so no content is ever dropped.
 */
export default function GenericBlock({ label, value }: GenericBlockProps) {
  if (value === null || value === undefined || value === '') return null;

  const title = humanizeKey(label);

  let body: ReactNode;

  if (isPrimitive(value)) {
    const text = formatPrimitive(value);
    body = text.includes('\n') ? (
      <CodeBlock code={text} language={title} />
    ) : (
      <p className="text-[#1d1c15]/80 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white shadow-sm whitespace-pre-line">
        {text}
      </p>
    );
  } else if (Array.isArray(value)) {
    if (value.length === 0) return null;
    body = value.every(isPrimitive) ? (
      <ul className="space-y-1.5 pl-1">
        {value.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-[#1d1c15]/85 leading-relaxed"
          >
            <span className="text-[#9f4122] mt-0.5 shrink-0 text-sm leading-none">•</span>
            <span>{formatPrimitive(item as string | number | boolean)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <CodeBlock code={JSON.stringify(value, null, 2)} language={title} />
    );
  } else {
    body = <CodeBlock code={JSON.stringify(value, null, 2)} language={title} />;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#89726b]">
        {title}
      </h4>
      {body}
    </div>
  );
}
