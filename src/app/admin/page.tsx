'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
} from 'lucide-react';

interface MetricsData {
  metrics: {
    totalUsers: number;
    totalCandidates: number;
    totalOrganizations: number;
    totalOpportunities: number;
    publishedOpportunities: number;
    totalApplications: number;
  };
  applicationsByStatus: { status: string; _count: { status: number } }[];
  recentAuditLogs: { id: string; action: string; targetType?: string; targetId?: string; details?: string; createdAt: string; user?: { email: string } }[];
}

interface UserItem {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  candidateProfile?: { fullName: string; city?: string };
  organizationMembers: { org: { name: string; verified: boolean } }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  async function loadAdminData() {
    try {
      const [resMetrics, resUsers] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/users'),
      ]);

      const dataMetrics = await resMetrics.json();
      const dataUsers = await resUsers.json();

      if (!resMetrics.ok) {
        setError(dataMetrics.error || 'Admin access forbidden');
      } else {
        setData(dataMetrics);
        setUsers(dataUsers.users || []);
      }
    } catch {
      setError('Network error loading admin dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function toggleUserStatus(userId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      if (res.ok) {
        setActionSuccess(`User status updated to ${nextStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update user');
      }
    } catch {
      alert('Error updating user status');
    }
  }

  async function toggleOrgVerification(orgId: string, currentVerified: boolean) {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified }),
      });

      if (res.ok) {
        setActionSuccess(`Organization verification status updated`);
        loadAdminData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch {
      alert('Error verifying organization');
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading administration portal...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--danger-text)' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>{error}</p>
        <p style={{ fontSize: '0.8125rem' }}>
          Please sign in using administrative credentials (<code>admin@opportunity.internal</code>).
        </p>
      </div>
    );
  }

  const { metrics, applicationsByStatus, recentAuditLogs } = data!;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={22} color="#0369a1" />
          <h1 style={{ margin: 0 }}>Platform Administration & Moderation</h1>
        </div>
        <p style={{ marginTop: '0.25rem' }}>
          Real-time system health, operational metrics, content moderation, and organization verification.
        </p>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Accounts</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{metrics.totalUsers}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Candidates & Recruiters</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Candidates</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--accent-primary)' }}>{metrics.totalCandidates}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Builders</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Organizations</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{metrics.totalOrganizations}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Startups</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Listings</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{metrics.publishedOpportunities}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Published Roles</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Applications</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.25rem' }}>{metrics.totalApplications}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Submissions</span>
        </div>
      </div>

      {/* Application Stage Breakdown */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recruitment Pipeline Health</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {applicationsByStatus.map((item) => (
            <div
              key={item.status}
              style={{
                background: 'var(--bg-subtle)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.status.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item._count.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Management & Moderation Table */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>User Accounts & Moderation</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>User Email</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Profile / Entity</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        background: 'var(--bg-subtle)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {u.candidateProfile?.fullName || u.organizationMembers[0]?.org.name || 'System Admin'}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: u.status === 'ACTIVE' ? 'var(--success-text)' : 'var(--danger-text)',
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    {u.role !== 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u.id, u.status)}
                        className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem' }}
                        id={`admin-toggle-${u.id}`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Operational Audit Trail</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentAuditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <strong>{log.action}</strong> ·{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {log.user?.email || 'System'} ({log.targetType || 'Action'})
                </span>
                {log.details && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {log.details.slice(0, 70)}
                  </span>
                )}
              </div>
              <span style={{ color: 'var(--text-muted)' }}>
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
