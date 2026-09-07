/**
 * DebugPage — Paste broken code, get a structured AI bug report.
 */
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Bug, Sparkles, Copy, CheckCheck, AlertCircle,
  AlertTriangle, Info, ChevronDown,
} from 'lucide-react';
import { debugApi, getErrorMessage } from '../services/api';
import type { DebugResponse, IssueDetail } from '../types';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

const BUGGY_EXAMPLE = `# Example buggy Python code
def find_max(numbers):
    max_val = 0  # Bug: should be numbers[0] or -infinity
    for i in range(len(numbers) + 1):  # Bug: off-by-one error
        if numbers[i] > max_val:
            max_val = numbers[i]
    return max_val

print(find_max([3, 1, 4, 1, 5, 9, 2, 6]))`;

const SEVERITY_STYLES: Record<string, { badge: string; icon: React.ElementType; border: string }> = {
  error:   { badge: 'badge-error',   icon: AlertCircle,   border: 'border-red-700/40 bg-red-900/10' },
  warning: { badge: 'badge-warning', icon: AlertTriangle, border: 'border-amber-700/40 bg-amber-900/10' },
  info:    { badge: 'badge-info',    icon: Info,          border: 'border-blue-700/40 bg-blue-900/10' },
};

function IssueCard({ issue }: { issue: IssueDetail }) {
  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.info;
  const SeverityIcon = style.icon;

  return (
    <div className={`rounded-xl border p-4 ${style.border} animate-fade-in`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <SeverityIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-200">{issue.problem}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge ${style.badge}`}>{issue.severity}</span>
          <span className="badge bg-surface-700 text-slate-400 border border-slate-600/40">{issue.category}</span>
          {issue.line && (
            <span className="text-xs font-mono text-slate-500">Line {issue.line}</span>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-2">{issue.explanation}</p>
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-800 border border-slate-700/40">
        <span className="text-xs font-semibold text-emerald-400 flex-shrink-0 mt-0.5">Fix:</span>
        <p className="text-xs text-slate-300">{issue.fix}</p>
      </div>
    </div>
  );
}

export function DebugPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedFixed, setCopiedFixed] = useState(false);

  const handleDebug = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await debugApi.debug({ code, language, error_message: errorMsg });
      setResult(res);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFixed = async () => {
    if (result?.corrected_code) {
      await navigator.clipboard.writeText(result.corrected_code);
      setCopiedFixed(true);
      setTimeout(() => setCopiedFixed(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bug className="w-4 h-4 text-red-400" />
          <span className="text-xs font-medium text-red-400 uppercase tracking-wide">AI Debugger</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">Debug Code</h1>
        <p className="text-slate-500 text-sm mt-1">Paste your code and get a structured bug analysis</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Input ─────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
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
            </div>

            <div className="mb-4">
              <label className="input-label">Error message (optional)</label>
              <input
                value={errorMsg}
                onChange={(e) => setErrorMsg(e.target.value)}
                placeholder="e.g., IndexError: list index out of range"
                className="input-field text-sm font-mono"
              />
            </div>

            <div className="mb-4">
              <label className="input-label">Code to debug</label>
              <div className="code-panel">
                <div className="code-panel-header">
                  <span className="text-xs text-slate-400 font-mono">input.{language}</span>
                  <button
                    onClick={() => setCode(BUGGY_EXAMPLE)}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Load example
                  </button>
                </div>
                <div className="h-60">
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
              onClick={handleDebug}
              disabled={loading || !code.trim()}
              className="btn-primary w-full justify-center py-2.5"
              style={{ backgroundColor: loading ? undefined : '#dc2626', borderColor: '#dc2626' }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#b91c1c'; }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#dc2626'; }}
            >
              {loading ? (
                <><div className="spinner w-4 h-4" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze & Debug</>
              )}
            </button>
          </div>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Summary */}
              <div className={`card border ${result.has_issues ? 'border-red-700/40 bg-red-900/10' : 'border-emerald-700/40 bg-emerald-900/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.has_issues ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={`text-sm font-semibold ${result.has_issues ? 'text-red-300' : 'text-emerald-300'}`}>
                    {result.has_issues ? `${result.issues.length} issue(s) detected` : 'No issues found — code looks good!'}
                  </span>
                </div>
                {result.overall_explanation && (
                  <p className="text-sm text-slate-400">{result.overall_explanation}</p>
                )}
              </div>

              {/* Issues list */}
              {result.issues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="section-title"><Bug className="w-4 h-4 text-red-400" /> Issues</h3>
                  {result.issues.map((issue, i) => (
                    <IssueCard key={i} issue={issue} />
                  ))}
                </div>
              )}

              {/* Corrected code */}
              {result.corrected_code && (
                <div className="code-panel">
                  <div className="code-panel-header">
                    <span className="text-xs text-emerald-400 font-mono font-semibold">✓ Corrected Code</span>
                    <button onClick={handleCopyFixed} className="btn-ghost text-xs py-1 px-2">
                      {copiedFixed ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <div className="h-60">
                    <Editor
                      language={language}
                      value={result.corrected_code}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
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
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-64 text-center">
              <Bug className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">Debug results will appear here</p>
              <p className="text-xs text-slate-700 mt-1">Paste your code and click "Analyze & Debug"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
