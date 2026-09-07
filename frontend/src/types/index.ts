// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
  access_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// ── Code Generation ───────────────────────────────────────────────────────────
export type SupportedLanguage = 'python' | 'c' | 'cpp' | 'java' | 'javascript';

export interface GenerateRequest {
  prompt: string;
  language: SupportedLanguage;
}

export interface GenerateResponse {
  success: boolean;
  session_id: string;
  language: string;
  code: string;
  explanation: string;
  suggestions: string[];
  error?: string;
}

// ── Debug ────────────────────────────────────────────────────────────────────
export interface DebugRequest {
  code: string;
  language: string;
  error_message?: string;
}

export interface IssueDetail {
  line?: number;
  severity: 'error' | 'warning' | 'info';
  category: 'syntax' | 'runtime' | 'logic' | 'style' | 'security';
  problem: string;
  explanation: string;
  fix: string;
}

export interface DebugResponse {
  success: boolean;
  session_id: string;
  language: string;
  has_issues: boolean;
  overall_explanation: string;
  issues: IssueDetail[];
  corrected_code?: string;
  error?: string;
}

// ── Explain ───────────────────────────────────────────────────────────────────
export interface ExplainRequest {
  code: string;
  language: string;
}

export interface SectionDetail {
  section: string;
  explanation: string;
}

export interface ExplainResponse {
  success: boolean;
  session_id: string;
  language: string;
  purpose: string;
  logic_breakdown: string;
  important_sections: SectionDetail[];
  potential_issues: string[];
  error?: string;
}

// ── History ───────────────────────────────────────────────────────────────────
export interface SessionSummary {
  id: string;
  session_type: 'generate' | 'debug' | 'explain';
  language: string;
  input_prompt: string;
  output_explanation?: string;
  created_at: string;
}

export interface HistoryResponse {
  items: SessionSummary[];
  total: number;
  page: number;
  page_size: number;
}

// ── Stats ────────────────────────────────────────────────────────────────────
export interface StatsResponse {
  total_sessions: number;
  generate_count: number;
  debug_count: number;
  explain_count: number;
  most_used_language?: string;
  member_since: string;
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  detail: string;
}
