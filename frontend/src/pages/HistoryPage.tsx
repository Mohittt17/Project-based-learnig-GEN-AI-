/**
 * HistoryPage — Paginated view of all past AI sessions.
 */
import { useEffect, useState } from 'react';
import {
  History, Code2, Bug, BookOpen, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw,
} from 'lucide-react';
import { historyApi, getErrorMessage } from '../services/api';
import type { SessionSummary, HistoryResponse } from '../types';

const TYPE_ICONS: Record<string, React.ElementType> = {
  generate: Code2,
  debug: Bug,
  explain: BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
  generate: 'text-primary-400',
  debug: 'text-red-400',
  explain: 'text-emerald-400',
};

function SessionRow({
  session,
  onDelete,
}: {
  session: SessionSummary;
  onDelete: (id: string) => void;
}) {
  const Icon = TYPE_ICONS[session.session_type] ?? Code2;
  const color = TYPE_COLORS[session.session_type] ?? 'text-slate-400';

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-800 border border-slate-700/40 hover:border-slate-600/60 transition-all animate-fade-in group">
      <div className={`mt-0.5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${
            session.session_type === 'generate' ? 'badge-generate' :
            session.session_type === 'debug' ? 'badge-debug' : 'badge-explain'
          }`}>
            {session.session_type}
          </span>
          <span className="text-xs font-mono text-slate-600 bg-surface-700 px-1.5 py-0.5 rounded">
            {session.language}
          </span>
        </div>
        <p className="text-sm text-slate-300 truncate">{session.input_prompt}</p>
        {session.output_explanation && (
          <p className="text-xs text-slate-600 mt-0.5 truncate">{session.output_explanation}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-slate-600">
          {new Date(session.created_at).toLocaleString()}
        </span>
        <button
          onClick={() => onDelete(session.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-all"
          title="Delete session"
          aria-label="Delete session"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (currentPage: number, typeFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyApi.getHistory(currentPage, 10, typeFilter || undefined);
      setData(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, filter);
  }, [page, filter]);

  const handleDelete = async (id: string) => {
    try {
      await historyApi.deleteSession(id);
      // Refresh current page
      fetchHistory(page, filter);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Session History</span>
        </div>
        <h1 className="text-xl font-bold text-slate-100">History</h1>
        <p className="text-slate-500 text-sm mt-1">All your past AI coding sessions</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {['', 'generate', 'debug', 'explain'].map((type) => (
            <button
              key={type}
              onClick={() => { setFilter(type); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                filter === type
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/40'
                  : 'bg-surface-700 text-slate-500 border border-slate-600/40 hover:text-slate-300'
              }`}
            >
              {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {data && (
          <span className="text-xs text-slate-600">{data.total} session{data.total !== 1 ? 's' : ''}</span>
        )}

        <button
          onClick={() => fetchHistory(page, filter)}
          className="btn-ghost text-xs py-1 px-2"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm mb-4">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-800 animate-pulse" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <History className="w-10 h-10 text-slate-700 mb-3" />
          <p className="text-sm text-slate-600">No sessions found</p>
          <p className="text-xs text-slate-700 mt-1">
            {filter ? `No ${filter} sessions yet` : 'Start by generating or debugging code'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.items.map((session) => (
            <SessionRow key={session.id} session={session} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-1.5 px-3 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-400">
            Page <span className="text-slate-200 font-medium">{page}</span> of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary py-1.5 px-3 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
