import { Link } from "react-router-dom";

export function AuthForm({
  title,
  description,
  fields,
  footerPrompt,
  footerLink,
  footerLabel,
  submitLabel,
  onSubmit,
  loading,
  error
}) {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Team Flow</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {fields}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Working..." : submitLabel}
          </button>
        </form>

        <p className="auth-footer">
          {footerPrompt} <Link to={footerLink}>{footerLabel}</Link>
        </p>
      </section>
    </div>
  );
}

