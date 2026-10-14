import React, {useCallback, useEffect, useState} from "react";
import "./AdminApp.css";

const projectTypes = [
  "AI/ML",
  "Data Science",
  "n8n Automation",
  "Web Development",
  "Virtual Assistant",
  "Social Media Management",
  "Other"
];

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (options.csrfToken) {
    headers["X-CSRF-Token"] = options.csrfToken;
  }
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin"
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The request could not be completed.");
  }
  if (!response.ok) {
    const error = new Error(
      result.error || "The request could not be completed."
    );
    error.status = response.status;
    throw error;
  }
  return result;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export function createGmailComposeUrl(message) {
  if (!message || typeof message.email !== "string" || !message.email.trim()) {
    return "";
  }

  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: message.email.trim(),
    su: `Re: ${message.subject || "Portfolio inquiry"}`,
    body: `Hi ${message.name || "there"},\n\n\n\n--- Original message ---\n${
      message.message || ""
    }`
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function Badge({children, variant = ""}) {
  return <span className={`admin-badge ${variant}`}>{children}</span>;
}

function Login({csrfToken, onLogin, error, busy}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    const result = await onLogin(email, password);
    if (result) {
      setMessage(result);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <a className="admin-back-link" href="/">
          ← Back to portfolio
        </a>
        <span className="admin-eyebrow">PRIVATE AREA</span>
        <h1>Admin sign in</h1>
        <p>Sign in to securely manage portfolio inquiries.</p>
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />
        </label>
        {(error || message) && (
          <p className="admin-error" role="alert">
            {error || message}
          </p>
        )}
        <button
          className="admin-primary-button"
          type="submit"
          disabled={busy || !csrfToken}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <span className="admin-login-note">
          Access is restricted to the portfolio owner.
        </span>
      </form>
    </main>
  );
}

function AdminDashboard({csrfToken, email, onLogout, onSessionExpired}) {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageTotal, setMessageTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    projectType: "",
    sort: "newest"
  });
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [dark, setDark] = useState(
    () => window.localStorage.getItem("portfolio-admin-theme") === "dark"
  );

  const refresh = useCallback(() => setRefreshKey(key => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    params.set("limit", "50");
    params.set("offset", String(page * 50));
    Promise.all([
      api("/api/admin/stats"),
      api(`/api/admin/messages?${params.toString()}`)
    ])
      .then(([nextStats, nextMessages]) => {
        if (active) {
          setStats(nextStats);
          setMessages(nextMessages.messages);
          setMessageTotal(nextMessages.total);
          if (!nextMessages.messages.length && page > 0) {
            setPage(page - 1);
          }
        }
      })
      .catch(requestError => {
        if (active) {
          if (requestError.status === 401) {
            onSessionExpired();
          } else {
            setError(requestError.message);
          }
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [filters, onSessionExpired, page, refreshKey]);

  function showRequestError(requestError) {
    if (requestError.status === 401) {
      onSessionExpired();
    } else {
      setError(requestError.message);
    }
  }

  function updateFilters(nextFilters) {
    setPage(0);
    setFilters(nextFilters);
  }

  async function openMessage(id) {
    setError("");
    setReplyError("");
    setSelected(null);
    try {
      const result = await api(`/api/admin/messages/${id}`);
      let message = result.message;
      if (message.status === "unread") {
        await api(`/api/admin/messages/${id}`, {
          method: "PATCH",
          csrfToken,
          body: JSON.stringify({status: "read"})
        });
        message = {
          ...message,
          status: "read",
          read_at: new Date().toISOString()
        };
        refresh();
      }
      setSelected(message);
    } catch (requestError) {
      showRequestError(requestError);
    }
  }

  async function updateMessage(changes) {
    if (!selected) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/messages/${selected.id}`, {
        method: "PATCH",
        csrfToken,
        body: JSON.stringify(changes)
      });
      if (changes.status) {
        setSelected({...selected, status: changes.status});
      }
      if (typeof changes.replied === "boolean") {
        setSelected({
          ...selected,
          replied_at: changes.replied ? new Date().toISOString() : null
        });
      }
      refresh();
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function deleteMessage() {
    if (
      !selected ||
      !window.confirm("Delete this inquiry permanently? This cannot be undone.")
    ) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/admin/messages/${selected.id}`, {
        method: "DELETE",
        csrfToken
      });
      setSelected(null);
      refresh();
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function retryEmail() {
    if (!selected) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/messages/${selected.id}/retry-email`, {
        method: "POST",
        csrfToken,
        body: JSON.stringify({})
      });
      const result = await api(`/api/admin/messages/${selected.id}`);
      setSelected(result.message);
      refresh();
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setBusy(false);
    }
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    window.localStorage.setItem(
      "portfolio-admin-theme",
      next ? "dark" : "light"
    );
  }

  function replyByEmail() {
    const replyUrl = createGmailComposeUrl(selected);
    if (!replyUrl) {
      setReplyError("This inquiry does not have an email address to reply to.");
      return;
    }

    setReplyError("");
    window.open(replyUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`admin-shell ${dark ? "admin-dark" : ""}`}>
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="admin-brand-mark">HM</span>
          <span>Portfolio Inbox</span>
        </a>
        <nav aria-label="Admin navigation">
          <a className="admin-nav-active" href="/admin">
            Inbox
          </a>
          <a href="/#contact">View public portfolio</a>
        </nav>
        <div className="admin-account">
          <span className="admin-avatar">HM</span>
          <span className="admin-account-email">{email}</span>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">PRIVATE DASHBOARD</span>
            <h1>Inquiries</h1>
          </div>
          <div className="admin-top-actions">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={toggleTheme}
            >
              {dark ? "Light theme" : "Dark theme"}
            </button>
            <button
              className="admin-secondary-button"
              type="button"
              onClick={onLogout}
            >
              Sign out
            </button>
          </div>
        </header>

        {stats && (
          <section className="admin-stat-grid" aria-label="Inquiry summary">
            <article className="admin-stat">
              <span>Total inquiries</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="admin-stat">
              <span>New / unread</span>
              <strong>{stats.unread}</strong>
            </article>
            <article className="admin-stat">
              <span>Read</span>
              <strong>{stats.read}</strong>
            </article>
            <article className="admin-stat">
              <span>Replied</span>
              <strong>{stats.replied}</strong>
            </article>
            <article
              className={`admin-stat ${
                stats.email_failures ? "admin-stat-warning" : ""
              }`}
            >
              <span>Email failures</span>
              <strong>{stats.email_failures}</strong>
            </article>
          </section>
        )}

        <section className="admin-inbox" aria-label="Contact messages">
          <div className="admin-toolbar">
            <form
              className="admin-search"
              onSubmit={event => {
                event.preventDefault();
                updateFilters({...filters, search: searchInput.trim()});
              }}
            >
              <label className="admin-visually-hidden" htmlFor="message-search">
                Search inquiries
              </label>
              <input
                id="message-search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Search name, email, subject"
              />
              <button className="admin-secondary-button" type="submit">
                Search
              </button>
            </form>
            <div className="admin-filters">
              <label>
                <span className="admin-visually-hidden">Filter by status</span>
                <select
                  value={filters.status}
                  onChange={event =>
                    updateFilters({...filters, status: event.target.value})
                  }
                >
                  <option value="">All statuses</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="email-failed">Email failed</option>
                  <option value="email-pending">Email pending</option>
                </select>
              </label>
              <label>
                <span className="admin-visually-hidden">
                  Filter by project type
                </span>
                <select
                  value={filters.projectType}
                  onChange={event =>
                    updateFilters({...filters, projectType: event.target.value})
                  }
                >
                  <option value="">All project types</option>
                  {projectTypes.map(type => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="admin-visually-hidden">Sort inquiries</span>
                <select
                  value={filters.sort}
                  onChange={event =>
                    updateFilters({...filters, sort: event.target.value})
                  }
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
          </div>

          {error && (
            <p className="admin-error admin-banner" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p className="admin-empty-state">Loading inquiries…</p>
          ) : messages.length ? (
            <div className="admin-message-layout">
              <div className="admin-message-list" aria-label="Inquiry list">
                {messages.map(message => (
                  <button
                    className={`admin-message-row ${
                      selected && selected.id === message.id ? "selected" : ""
                    } ${message.status === "unread" ? "unread" : ""}`}
                    type="button"
                    key={message.id}
                    onClick={() => openMessage(message.id)}
                  >
                    <span className="admin-message-row-top">
                      <strong>{message.name}</strong>
                      <time dateTime={message.created_at}>
                        {formatDate(message.created_at)}
                      </time>
                    </span>
                    <span className="admin-message-subject">
                      {message.subject}
                    </span>
                    <span className="admin-message-preview">
                      {message.preview}
                    </span>
                    <span className="admin-badge-line">
                      <Badge
                        variant={message.status === "unread" ? "badge-new" : ""}
                      >
                        {message.status}
                      </Badge>
                      <Badge>{message.project_type}</Badge>
                      <Badge variant={`badge-${message.email_status}`}>
                        Email {message.email_status}
                      </Badge>
                      {message.replied_at && (
                        <Badge variant="badge-replied">Replied</Badge>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <article className="admin-message-detail">
                {selected ? (
                  <>
                    <div className="admin-detail-heading">
                      <div>
                        <span className="admin-eyebrow">
                          {selected.project_type}
                        </span>
                        <h2>{selected.subject}</h2>
                      </div>
                      <button
                        className="admin-icon-button"
                        aria-label="Delete inquiry"
                        type="button"
                        disabled={busy}
                        onClick={deleteMessage}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="admin-sender">
                      <strong>{selected.name}</strong>
                      <a href={`mailto:${selected.email}`}>{selected.email}</a>
                      <time dateTime={selected.created_at}>
                        {formatDate(selected.created_at)}
                      </time>
                    </div>
                    <div className="admin-detail-badges">
                      <Badge
                        variant={
                          selected.status === "unread" ? "badge-new" : ""
                        }
                      >
                        {selected.status}
                      </Badge>
                      <Badge variant={`badge-${selected.email_status}`}>
                        Notification {selected.email_status}
                      </Badge>
                      {selected.replied_at && (
                        <Badge variant="badge-replied">Replied</Badge>
                      )}
                    </div>
                    {(selected.email_status === "failed" ||
                      selected.email_status === "pending") && (
                      <div className="admin-delivery-warning" role="status">
                        Notification{" "}
                        {selected.email_status === "failed"
                          ? "delivery failed"
                          : "is pending"}
                        {selected.email_error
                          ? ` (${selected.email_error})`
                          : ""}
                        .
                        {selected.email_attempts > 0 &&
                          ` Attempts: ${selected.email_attempts}.`}
                        <button
                          type="button"
                          onClick={retryEmail}
                          disabled={busy}
                        >
                          Retry email
                        </button>
                      </div>
                    )}
                    <p className="admin-full-message">{selected.message}</p>
                    <div className="admin-detail-actions">
                      <button
                        className="admin-primary-button"
                        type="button"
                        onClick={replyByEmail}
                      >
                        Reply by email
                      </button>
                      <button
                        className="admin-secondary-button"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateMessage({replied: !selected.replied_at})
                        }
                      >
                        {selected.replied_at
                          ? "Mark not replied"
                          : "Mark replied"}
                      </button>
                      <button
                        className="admin-secondary-button"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateMessage({
                            status:
                              selected.status === "read" ? "unread" : "read"
                          })
                        }
                      >
                        Mark {selected.status === "read" ? "unread" : "read"}
                      </button>
                    </div>
                    {replyError && (
                      <p className="admin-error" role="alert">
                        {replyError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="admin-detail-placeholder">
                    Select an inquiry to read the full message.
                  </div>
                )}
              </article>
            </div>
          ) : (
            <div className="admin-empty-state">
              <strong>No inquiries found</strong>
              <span>New contact form submissions will appear here.</span>
            </div>
          )}
          {!loading && messageTotal > 50 && (
            <div className="admin-pagination" aria-label="Inquiry pages">
              <span>
                Showing {page * 50 + 1}–
                {Math.min((page + 1) * 50, messageTotal)} of {messageTotal}
              </span>
              <div>
                <button
                  className="admin-secondary-button"
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="admin-secondary-button"
                  type="button"
                  disabled={(page + 1) * 50 >= messageTotal}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [status, setStatus] = useState("checking");
  const [csrfToken, setCsrfToken] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api("/api/admin/csrf")
      .then(result => {
        if (active) {
          setCsrfToken(result.csrfToken);
          return api("/api/admin/session");
        }
        return null;
      })
      .then(result => {
        if (active && result) {
          setStatus(result.authenticated ? "authenticated" : "anonymous");
          setEmail(result.email || "");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
          setError("The admin service is unavailable. Please try again later.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(loginEmail, password) {
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/admin/login", {
        method: "POST",
        csrfToken,
        body: JSON.stringify({email: loginEmail, password})
      });
      setCsrfToken(result.csrfToken);
      setEmail(result.email);
      setStatus("authenticated");
      return "";
    } catch (requestError) {
      setError(requestError.message);
      return requestError.message;
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await api("/api/admin/logout", {
        method: "POST",
        csrfToken,
        body: JSON.stringify({})
      });
      setStatus("anonymous");
    } catch (requestError) {
      if (requestError.status === 401) {
        refreshAdminSession();
      } else {
        setError(requestError.message);
      }
    }
  }

  const refreshAdminSession = useCallback(async () => {
    setStatus("checking");
    setError("");
    try {
      const result = await api("/api/admin/csrf");
      setCsrfToken(result.csrfToken);
      setStatus("anonymous");
    } catch {
      setStatus("error");
      setError("The admin service is unavailable. Please try again later.");
    }
  }, []);

  if (status === "checking") {
    return (
      <main className="admin-login-page">
        <p>Checking admin session…</p>
      </main>
    );
  }
  if (status === "error") {
    return (
      <main className="admin-login-page">
        <p className="admin-error" role="alert">
          {error}
        </p>
      </main>
    );
  }
  if (status !== "authenticated") {
    return (
      <Login csrfToken={csrfToken} onLogin={login} error={error} busy={busy} />
    );
  }
  return (
    <AdminDashboard
      csrfToken={csrfToken}
      email={email}
      onLogout={logout}
      onSessionExpired={refreshAdminSession}
    />
  );
}
