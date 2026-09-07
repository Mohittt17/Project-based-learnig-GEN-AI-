/**
 * DashboardPage — Overview with stats, quick actions, and recent history.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2, Bug, BookOpen, History, Zap,
  TrendingUp, Clock, BarChart3, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { statsApi, historyApi } from '../services/api';
import type { StatsResponse, SessionSummary } from '../types';

// ── Subcomponents ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="card flex items-center gap-4 animate-fade-in">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="stat-value text-2xl">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ to, icon: Icon, label, description, color }: { to: string; icon: React.ElementType; label: string; description: string; color: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="card-hover text-left w-full group cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </button>
  );
}

function SessionTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    generate: 'badge-generate',
    debug: 'badge-debug',
    explain: 'badge-explain',
  };
  return <span className={styles[type] || 'badge'}>{type}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recent, setRecent] = useState<SessionSummary[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          statsApi.getStats(),
          historyApi.getHistory(1, 5),
        ]);
        setStats(statsData);
        setRecent(historyData.items);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-primary-400" />
          <span className="text-xs font-medium text-primary-400 uppercase tracking-wide">AI Code Assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          {timeOfDay()}, {user?.username} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your AI-powered coding workspace is ready.
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 text-sm mb-6">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-surface-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Sessions" value={stats?.total_sessions ?? 0} icon={BarChart3} color="bg-primary-600/20 text-primary-400" />
          <StatCard label="Generated" value={stats?.generate_count ?? 0} icon={Code2} color="bg-primary-600/20 text-primary-400" />
          <StatCard label="Debugged" value={stats?.debug_count ?? 0} icon={Bug} color="bg-red-600/20 text-red-400" />
          <StatCard label="Explained" value={stats?.explain_count ?? 0} icon={BookOpen} color="bg-emerald-600/20 text-emerald-400" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="section-title mb-4">
            <Zap className="w-4 h-4 text-primary-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              to="/generate"
              icon={Code2}
              label="Generate Code"
              description="Describe what you need and get working code"
              color="bg-primary-600/20 text-primary-400"
            />
            <QuickActionCard
              to="/debug"
              icon={Bug}
              label="Debug Code"
              description="Paste broken code and get a structured bug report"
              color="bg-red-600/20 text-red-400"
            />
            <QuickActionCard
              to="/explain"
              icon={BookOpen}
              label="Explain Code"
              description="Understand any code with a clear AI explanation"
              color="bg-emerald-600/20 text-emerald-400"
            />
          </div>

          {/* Upcoming features */}
          <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-700 bg-surface-800/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">Coming in Review 2</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Code Execution', 'Complexity Analysis', 'Test Generation', 'Code Quality Score', 'Auto Fix'].map(f => (
                <span key={f} className="badge bg-surface-700 text-slate-500 border border-slate-600/40">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Activity
            </h2>
            <button onClick={() => navigate('/history')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recent.length === 0 && !loadingStats ? (
              <div className="text-center py-8 text-slate-600">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No sessions yet</p>
                <p className="text-xs mt-1">Generate or debug your first code above</p>
              </div>
            ) : (
              recent.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg bg-surface-800 border border-slate-700/40 hover:border-slate-600/60 transition-colors cursor-pointer"
                  onClick={() => navigate('/history')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <SessionTypeBadge type={session.session_type} />
                    <span className="text-[10px] text-slate-600">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{session.input_prompt}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{session.language}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
