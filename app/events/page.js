'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, clearSession, formatDate, getToken, getUser } from '../../lib/api';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch('/api/events');
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
      if (/token/i.test(err.message)) {
        clearSession();
        router.replace('/');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
      return;
    }
    setUser(getUser());
    load();
  }, [load, router]);

  function handleLogout() {
    clearSession();
    router.replace('/');
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">E</span>
          <strong>EventHub</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="topbar-user">{user?.email || ''}</span>
          <button type="button" className="logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page">
        <div className="page-head">
          <div>
            <h1>Upcoming events</h1>
            <p>Everything happening in the next few months.</p>
          </div>
          <span className="count-pill">{events.length} events</span>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {loading ? (
          <div className="empty">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="empty">No events found.</div>
        ) : (
          <div className="grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <span className="event-date">{formatDate(event.starts_at)} UTC</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span>{event.venue}</span>
                  <span>{event.capacity} seats</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
