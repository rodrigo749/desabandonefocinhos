"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaw, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../../login-usuario/login.module.css";
import { getApiUrl } from '@/lib/apiUrl'

const getApiBaseUrl = () => getApiUrl();


export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
        const res = await fetch(`${getApiBaseUrl()}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao autenticar.");
        return;
      }

      const adminUser = data.user;
      localStorage.setItem("usuarioLogado", JSON.stringify(adminUser));
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/admin");
    } catch (err) {
      console.error("Erro ao autenticar:", err);
      setError("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Painel Administrativo</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <FaPaw />
          </span>
          <label className={styles.fieldLabel}>
            E-mail:
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="admin@petz.com"
              autoComplete="username"
            />
          </label>
        </div>

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <FaPaw />
          </span>
          <label className={styles.fieldLabel}>
            Senha:
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Digite a senha"
              autoComplete="current-password"
            />
          </label>
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className={styles.button} type="submit">
          Entrar como Admin
        </button>
      </form>
    </div>
  );
}