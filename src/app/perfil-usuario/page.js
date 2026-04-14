"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaw } from "react-icons/fa";
import styles from "./perfilUsuario.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper para obter URL completa da imagem
const getImageUrl = (imagem) => {
  if (!imagem) return "/images/icone-perfil.jpg";
  if (imagem.startsWith("blob:")) return imagem;
  if (imagem.startsWith("http")) return imagem;
  return `${API_URL}${imagem}`;
};

export default function PerfilUsuario() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    if (!u) {
      // if no user is logged, redirect to the appropriate login page
      router.push("/login-usuario");
      return;
    }
    setUsuario(u);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Excluir conta?")) return;

    setError("");
    setIsLoading(true);

    try {
      const { logged, token } = getAuthData();

      if (!logged?.id) {
        showToast("Usuário não identificado", "warning");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/users/${logged.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao excluir");
      }

      localStorage.removeItem("usuarioLogado");
      localStorage.removeItem("token");
      showToast("Conta excluída com sucesso", "success");
      router.push("/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao excluir");
      showToast(err.message || "Erro ao excluir", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden>
            <FaPaw />
          </span>
          <h1 className={styles.title}>Meu Perfil</h1>
        </div>

        <div className={styles.avatarSection}>
          <img
            src={getImageUrl(usuario.imagem)}
            alt="Foto de perfil"
            className={styles.avatarImage}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.row}>
            <strong>Nome:</strong>
            <span>{usuario.nome || usuario.razaoSocial || "-"}</span>
          </div>
          <div className={styles.row}>
            <strong>Email:</strong>
            <span>{usuario.email || "-"}</span>
          </div>
          <div className={styles.row}>
            <strong>CNPJ/CPF:</strong>
            <span>{usuario.cnpj || usuario.cpf || "-"}</span>
          </div>
          <div className={styles.row}>
            <strong>Telefone:</strong>
            <span>{usuario.telefone || "-"}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} onClick={handleLogout}>
            Sair
          </button>
          <button className={styles.delete} onClick={handleDeleteAccount}>
            Excluir conta
          </button>
          <button className={styles.button} onClick={() => router.push('/editar-usuario')}>
            editar perfil
          </button>
        </div>
      </div>
    </div>
  );
}
