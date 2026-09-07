/**
 * ExplainPage — Paste code and get a structured AI explanation.
 */
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  BookOpen, Sparkles, AlertCircle, ChevronDown,
  Target, GitBranch, AlertTriangle,
} from 'lucide-react';
import { explainApi, getErrorMessage } from '../services/api';
import type { ExplainResponse } from '../types';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

const EXAMPLE_CODE = `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`;

export function ExplainPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await explainApi.explain({ code, language });
      setResult(res);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">AI Code Explainer</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Explain Code</h1>
        <p className="text-slate-500 text-sm mt-1">Paste any code and get a clear, structured explanation</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card">
            <div className="mb-4">
              <label className="input-label">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input-field appearance-none pr-8"
                >
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="mb-4">
              <label className="input-label">Code to explain</label>
              <div className="code-panel">
                <div className="code-panel-header">
                  <span className="text-xs text-slate-400 font-mono">input.{language}</span>
                  <button
                    onClick={() => { setCode(EXAMPLE_CODE); setLanguage('python'); }}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Load example
                  </button>
                </div>
                <div className="h-72">
                  <Editor
                    language={language}
                    value={code}
                    onChange={(v) => setCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 8, bottom: 8 },
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  />
                </div>
              </div>
            </div>

            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {apiError}
              </div>
            )}

            <button
              onClick={handleExplain}
              disabled={loading || !code.trim()}
              className="btn-primary w-full justify-center py-2.5"
              style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            >
              {loading ? (
                <><div className="spinner w-4 h-4" /> Explaining...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Explain Code</>
              )}
            </button>
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Purpose */}
              <div className="card animate-fade-in">
                <h3 className="section-title mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Purpose
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{result.purpose}</p>
              </div>

              {/* Logic breakdown */}
              <div className="card animate-fade-in">
                <h3 className="section-title mb-2">
                  <GitBranch className="w-4 h-4 text-primary-400" />
                  How it works
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result.logic_breakdown}</p>
              </div>

              {/* Important sections */}
              {result.important_sections.length > 0 && (
                <div className="card animate-fade-in">
                  <h3 className="section-title mb-3">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Key Sections
                  </h3>
                  <div className="space-y-3">
                    {result.important_sections.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-700 border border-slate-600/40">
                        <p className="text-xs font-semibold text-primary-300 font-mono mb-1">{s.section}</p>
                        <p className="text-sm text-slate-400">{s.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential issues */}
              {result.potential_issues.length > 0 && (
                <div className="card animate-fade-in border-amber-700/40 bg-amber-900/10">
                  <h3 className="section-title mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Potential Issues
                  </h3>
                  <ul className="space-y-1.5">
                    {result.potential_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-300/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">Explanation will appear here</p>
              <p className="text-xs text-slate-700 mt-1">Paste your code and click "Explain Code"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
