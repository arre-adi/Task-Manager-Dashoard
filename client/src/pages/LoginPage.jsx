import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm.jsx";
import { useAuth } from "../hooks/useAuth.js";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, authLoading } = useAuth();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(formState);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <AuthForm
      title="Welcome back"
      submitLabel="Login"
      onSubmit={handleSubmit}
      loading={authLoading}
      error={error}
      footerPrompt="Need an account?"
      footerLink="/signup"
      footerLabel="Create one"
      fields={
        <>
          <label>
            Email
            <input name="email" onChange={updateField} required type="email" value={formState.email} />
          </label>
          <label>
            Password
            <input
              name="password"
              onChange={updateField}
              required
              type="password"
              value={formState.password}
            />
          </label>
        </>
      }
    >
      <div className="test-credentials">
        <h3>Test Accounts</h3>
        <div className="test-user">
          <div>
            <strong>Ava Admin</strong>
            <span>admin@taskorbit.dev</span>
          </div>
          <span className="copy-hint" onClick={() => setFormState({ email: "admin@taskorbit.dev", password: "password123" })}>
            Use this
          </span>
        </div>
        <div className="test-user">
          <div>
            <strong>Priya Nair</strong>
            <span>priya@taskorbit.dev</span>
          </div>
          <span className="copy-hint" onClick={() => setFormState({ email: "priya@taskorbit.dev", password: "password123" })}>
            Use this
          </span>
        </div>
        <div className="test-user">
          <div>
            <strong>Arjun Mehta</strong>
            <span>arjun@taskorbit.dev</span>
          </div>
          <span className="copy-hint" onClick={() => setFormState({ email: "arjun@taskorbit.dev", password: "password123" })}>
            Use this
          </span>
        </div>
      </div>
    </AuthForm>
  );
}

