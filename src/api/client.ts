import type {
  ClaimInvitePayload,
  BootstrapPayload,
  Draft,
  LoginPayload,
  ReactionType,
  ReportStatus,
  SessionPayload,
} from '../types'

let csrfToken: string | null = null

function setCsrfToken(value: string | null | undefined) {
  csrfToken = value ?? null
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET'
  const response = await fetch(input, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(method !== 'GET' && csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Request failed')
  }

  const payload = (await response.json()) as T
  if (payload && typeof payload === 'object' && 'csrfToken' in payload) {
    setCsrfToken((payload as unknown as SessionPayload | BootstrapPayload).csrfToken)
  }
  return payload
}

export const apiClient = {
  getSession() {
    return request<SessionPayload>('/api/auth/session')
  },
  login(payload: LoginPayload) {
    return request<SessionPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  logout() {
    return request<{ ok: true }>('/api/auth/logout', {
      method: 'POST',
    })
  },
  bootstrap() {
    return request<BootstrapPayload>('/api/bootstrap')
  },
  createPost(draft: Draft) {
    return request<BootstrapPayload>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
  },
  addReaction(postId: number, type: ReactionType) {
    return request<BootstrapPayload>(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    })
  },
  addReport(postId: number, reason: string) {
    return request<BootstrapPayload>(`/api/posts/${postId}/reports`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },
  addComment(postId: number, body: string) {
    return request<BootstrapPayload>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  },
  claimPost(postId: number) {
    return request<BootstrapPayload>(`/api/posts/${postId}/claim`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  createClaimInvite(postId: number) {
    return request<{ csrfToken: string; inviteLink: string }>(`/api/posts/${postId}/invite`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  getClaimInvite(token: string) {
    return request<ClaimInvitePayload>(`/api/claim/${token}`)
  },
  claimViaInvite(token: string) {
    return request<BootstrapPayload>(`/api/claim/${token}`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  updateReportStatus(reportId: number, status: ReportStatus) {
    return request<BootstrapPayload>(`/api/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  markNotificationRead(notificationId: number) {
    return request<BootstrapPayload>(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
  },
  resetDemo() {
    return request<BootstrapPayload>('/api/admin/reset-demo', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  getAuditLogs() {
    return request<{ csrfToken: string; auditLogs: import('../types').AuditLog[] }>('/api/admin/audit-logs')
  },
}
