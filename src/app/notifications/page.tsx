'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 6rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1>In-App Notifications</h1>
          <p style={{ marginTop: '0.25rem' }}>
            Real-time updates regarding application stages, newly computed matches, and system events.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="btn btn-secondary btn-sm"
            id="mark-all-read-btn"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading your notification inbox...
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Bell size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No notifications yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            When startups review your applications or new matches are discovered, alerts will appear here.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: '1.25rem',
              background: n.read ? 'var(--bg-surface)' : 'var(--bg-canvas)',
              borderColor: n.read ? 'var(--border-subtle)' : 'var(--accent-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: n.read ? 'var(--bg-subtle)' : 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {n.type === 'MATCH_ALERT' ? (
                  <Sparkles size={16} color="var(--accent-primary)" />
                ) : (
                  <Bell size={16} color={n.read ? 'var(--text-muted)' : 'var(--accent-primary)'} />
                )}
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>{n.title}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => markAsRead(n.id)}
                      style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      View Details <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {!n.read && (
              <button
                type="button"
                onClick={() => markAsRead(n.id)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                title="Mark as read"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
