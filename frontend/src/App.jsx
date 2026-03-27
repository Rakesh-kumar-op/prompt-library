import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000";

function App() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    use_case: "",
  });

  const fetchPrompts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/prompts`);
      if (!res.ok) throw new Error("Failed to fetch prompts");
      const data = await res.json();
      setPrompts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create prompt");
      setForm({ title: "", content: "", tags: "", use_case: "" });
      await fetchPrompts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/prompts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 AI Prompt Library</h1>
        <p className="subtitle">Store, organise and reuse your best prompts</p>
      </header>

      <main className="app-main">
        {/* ── Add Prompt Form ── */}
        <section className="card form-card">
          <h2>Add New Prompt</h2>
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="form-row">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Blog post outline generator"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="content">Prompt Content *</label>
              <textarea
                id="content"
                name="content"
                rows={5}
                placeholder="Write your full prompt here…"
                value={form.content}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row two-col">
              <div>
                <label htmlFor="tags">Tags</label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  placeholder="writing, SEO, marketing"
                  value={form.tags}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="use_case">Use Case</label>
                <input
                  id="use_case"
                  name="use_case"
                  type="text"
                  placeholder="Content creation"
                  value={form.use_case}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "➕ Add Prompt"}
            </button>
          </form>
        </section>

        {/* ── Prompt List ── */}
        <section className="prompts-section">
          <h2>
            Your Prompts{" "}
            <span className="badge">{prompts.length}</span>
          </h2>

          {loading ? (
            <p className="status-msg">Loading prompts…</p>
          ) : prompts.length === 0 ? (
            <p className="status-msg">No prompts yet. Add your first one above!</p>
          ) : (
            <div className="prompts-grid">
              {prompts.map((prompt) => (
                <article key={prompt.id} className="card prompt-card">
                  <div className="prompt-card-header">
                    <h3>{prompt.title}</h3>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(prompt.id)}
                      aria-label={`Delete prompt: ${prompt.title}`}
                    >
                      🗑 Delete
                    </button>
                  </div>

                  <p className="prompt-content">{prompt.content}</p>

                  <div className="prompt-meta">
                    {prompt.use_case && (
                      <span className="meta-chip use-case">{prompt.use_case}</span>
                    )}
                    {prompt.tags &&
                      prompt.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <span key={tag} className="meta-chip tag">
                            #{tag}
                          </span>
                        ))}
                  </div>

                  <time className="created-at">
                    {new Date(prompt.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
