import { useState } from 'react';

interface Props {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'formula' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="relative group rounded-2xl border border-white/80 bg-white/70 backdrop-blur-md overflow-hidden my-3 shadow-[0_4px_16px_rgba(159,65,34,0.03)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#89726b]/10 bg-white/40">
        <span className="text-[10px] font-bold tracking-wider text-[#89726b] uppercase font-mono">
          {language}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9f4122] hover:text-[#752305] transition-colors px-2.5 py-1 rounded-full hover:bg-white/90 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-[#1d1c15]/90 bg-white/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}
