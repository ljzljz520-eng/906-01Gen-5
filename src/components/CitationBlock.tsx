import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CitationFormat, CitationFormatKey } from '../types';

interface Props {
  citation: CitationFormat;
}

const tabs: { key: CitationFormatKey; label: string }[] = [
  { key: 'bibtex', label: 'BibTeX' },
  { key: 'apa', label: 'APA' },
  { key: 'mla', label: 'MLA' },
];

export function CitationBlock({ citation }: Props) {
  const [active, setActive] = useState<CitationFormatKey>('bibtex');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-academic-100 bg-white">
      <div className="flex items-center justify-between border-b border-academic-100 bg-academic-50/60 px-4 py-2">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                active === t.key
                  ? 'bg-white text-academic-900 shadow-sm'
                  : 'text-academic-600 hover:text-academic-800 hover:bg-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-academic-700 hover:bg-white hover:text-academic-900 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success-700" />
              <span className="text-success-700">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-5 bg-academic-900/95 text-academic-50 overflow-x-auto scrollbar-thin text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words">
        <code>{citation[active]}</code>
      </pre>
    </div>
  );
}
