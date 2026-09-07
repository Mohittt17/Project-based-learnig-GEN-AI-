/**
 * GeneratePage — AI Code Generator with Monaco editor output.
 */
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code2, Sparkles, Copy, RotateCcw, ChevronDown,
  CheckCheck, AlertCircle, Lightbulb,
} from 'lucide-react';
import { generateApi, getErrorMessage } from '../services/api';
import type { GenerateResponse, SupportedLanguage } from '../types';

const LANGUAGES: { value: SupportedLanguage; label: string; monaco: string }[] = [
  { value: 'python',     label: 'Python',     monaco: 'python' },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'java',       label: 'Java',       monaco: 'java' },
  { value: 'cpp',        label: 'C++',        monaco: 'cpp' },
  { value: 'c',          label: 'C',          monaco: 'c' },
];

const EXAMPLES = [
  'Create a Python function to find duplicates in a list',
  'Write a Java program to implement a stack using an array',
  'Build a C++ function to reverse a linked list',
  'Write a Python binary search algorithm',
];

export function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const monacoLang = LANGUAGES.find(l => l.value === language)?.monaco ?? 'python';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateApi.generate({ prompt, language });
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.code) {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-primary-400" />
          <span className="text-xs font-medium text-primary-400 uppercase tracking-wide">AI Code Generator</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Generate Code</h1>
        <p className="text-slate-500 text-sm mt-1">Describe what you want to build in natural language</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Input Panel ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card">
            {/* Language selector */}
            <div className="mb-4">
              <label className="input-label">Programming Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="input-field appearance-none pr-8 cursor-pointer"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Prompt textarea */}
            <div className="mb-4">
              <label className="input-label">Describe what you want to build</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a Python function to find all duplicate elements in an array and return them as a set..."
                className="input-field resize-none h-36 font-mono text-sm"
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                <p className="text-[11px] text-slate-600">Be specific for better results</p>
                <p className="text-[11px] text-slate-600">{prompt.length}/2000</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <><div className="spinner w-4 h-4" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Code</>
              )}
            </button>
          </div>

          {/* Example prompts */}
          <div className="card">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              <Lightbulb className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
              Example prompts
            </p>
            <div className="space-y-1.5">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface-700 text-slate-400 hover:text-slate-200 hover:bg-surface-600 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Output Panel ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Code editor */}
          <div className="code-panel">
            <div className="code-panel-header">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  {result ? `generated.${language === 'cpp' ? 'cpp' : language === 'javascript' ? 'js' : language}` : 'output'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result?.code && (
                  <button onClick={handleCopy} className="btn-ghost text-xs py-1 px-2">
                    {copied ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                )}
                {result && (
                  <button
                    onClick={handleGenerate}
                    className="btn-ghost text-xs py-1 px-2"
                    disabled={loading}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                )}
              </div>
            </div>
            <div className="h-72">
              <Editor
                language={monacoLang}
                value={result?.code || '// Your generated code will appear here...'}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                }}
              />
            </div>
          </div>

          {/* Explanation panel */}
          {result && (
            <div className="card animate-fade-in space-y-4">
              <div>
                <h3 className="section-title mb-2">
                  <BookOpenIcon className="w-4 h-4 text-primary-400" />
                  Explanation
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>

              {result.suggestions.length > 0 && (
                <div>
                  <h3 className="section-title mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Suggestions
                  </h3>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline helper icon to avoid import issues
function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
