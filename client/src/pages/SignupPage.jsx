import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm.jsx";
import { useAuth } from "../hooks/useAuth.js";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, authLoading } = useAuth();
  const [formState, setFormState] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await signup(formState);
      navigate("/dashboard");
    } catch (signupError) {
      setError(signupError.message);
    }
  }

  return (
    <AuthForm
      title="Build a calmer team workspace"
      description="Create projects, assign work, and keep progress visible without losing clarity."
      submitLabel="Create Account"
      onSubmit={handleSubmit}
      loading={authLoading}
      error={error}
      footerPrompt="Already have an account?"
      footerLink="/login"
      footerLabel="Login"
      fields={
        <>
          <label>
            Name
            <input name="name" onChange={updateField} required value={formState.name} />
          </label>
          <label>
            Email
            <input name="email" onChange={updateField} required type="email" value={formState.email} />
          </label>
          <label>
            Password
            <input
              name="password"
              onChange={updateField}
              minLength="8"
              required
              type="password"
              value={formState.password}
            />
          </label>
        </>
      }
    />
  );
}

