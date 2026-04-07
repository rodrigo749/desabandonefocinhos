"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaw, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./login.module.css";
import useSafeToast from "@/components/Toast/useSafeToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useSafeToast();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCPF = (value) => {
    const digits = (value || "").replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cpf || !password) {
      const msg = "Por favor, preencha CPF e senha.";
      setError(msg);
      showToast(msg, "warning");
      return;
    }

    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/\D/g, "");

      const resp = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cpf: cpfLimpo,
        password: password,
      }),
    });


      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg =
          data?.message ||
          "CPF ou senha incorretos. Caso não tenha cadastro, clique em cadastrar.";
        setError(msg);
        showToast(msg, "error");
        return;
      }

      // Esperado: { token, user }
      if (!data?.token) {
        throw new Error("Token não retornado pelo backend.");
      }

      // Prepara o objeto do usuário com a URL da imagem
      const userObj = data.user || {};
      if (userObj.hasImage && userObj.id) {
        userObj.imagem = `${API_URL}/api/users/${userObj.id}/image`;
      }

      // Salva token e usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioLogado", JSON.stringify(userObj));

      // Dispara evento para o Header atualizar imediatamente
      window.dispatchEvent(new Event("auth-changed"));

      showToast("Login realizado com sucesso!", "success");
      router.push("/home");
    } catch (err) {
      console.error(err);
      const msg = "Erro ao processar o login. Tente novamente.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Faça o login ou crie uma conta</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <FaPaw />
          </span>

          <label className={styles.fieldLabel}>
            CPF:
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => {
                setCpf(formatCPF(e.target.value));
                if (error) setError("");
              }}
              placeholder="000.000.000-00"
              aria-label="CPF"
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
              aria-label="Senha"
              placeholder="Digite sua senha"
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

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className={styles.bottomLink}>
          Cadastre-se <a href="/cadastro-usuario">aqui</a>.
        </div>
      </form>
    </div>
  );
}
