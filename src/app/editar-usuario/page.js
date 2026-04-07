"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPaw } from "react-icons/fa";
import styles from "./editar-usuario.module.css";
import useSafeToast from "@/components/Toast/useSafeToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function EditarUsuarioPage() {
  const { showToast } = useSafeToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    password: "",
    imagem: "",
    tipo: "usuario",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthData = () => {
    const logged = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    const token = localStorage.getItem("token") || "";
    return { logged, token };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        const { logged, token } = getAuthData();

        if (!logged?.id) {
          showToast("Usuário não identificado", "warning");
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/api/users/${logged.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao buscar dados do usuário");
        }

        const userData = await res.json();

        setFormData({
          nome: userData.nome || userData.razaoSocial || "",
          cpf: userData.cpf || "",
          email: userData.email || "",
          telefone: userData.telefone || "",
          password: "",
          imagem: userData.imagem || "",
          tipo: userData.tipo || "usuario",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Erro ao carregar dados do usuário");
        showToast(err.message || "Erro ao carregar dados do usuário", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, showToast]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { logged, token } = getAuthData();

      if (!logged?.id) {
        showToast("Usuário não identificado", "warning");
        router.push("/login");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("nome", formData.nome);
      formDataToSend.append("cpf", formData.cpf);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("telefone", formData.telefone);
      formDataToSend.append("tipo", formData.tipo);

      if (formData.password) {
        formDataToSend.append("password", formData.password);
      }

      if (imageFile) {
        formDataToSend.append("imagem", imageFile);
      }

      const res = await fetch(`${API_URL}/api/users/${logged.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Erro ao salvar");
        showToast(data.message || "Erro ao salvar", "error");
        return;
      }

      // Se o usuário tem imagem (hasImage), define a URL do endpoint de imagem
      const userObj = { ...data };
      if (userObj.hasImage && logged.id) {
        userObj.imagem = `${API_URL}/api/users/${logged.id}/image`;
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(userObj));
      window.dispatchEvent(new Event("auth-changed"));
      showToast("Dados atualizados com sucesso!", "success");

      setTimeout(() => {
        router.push("/perfil-usuario");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Erro de rede");
      showToast("Erro de rede", "error");
    } finally {
      setIsLoading(false);
    }
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
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao excluir");
      showToast(err.message || "Erro ao excluir", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para obter URL completa da imagem
  const getImageUrl = (imagem) => {
    if (!imagem) return null;
    if (imagem.startsWith("blob:")) return imagem;
    if (imagem.startsWith("http")) return imagem;
    return `${API_URL}${imagem}`;
  };

  const previewSrc = imagePreview || getImageUrl(formData.imagem);

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Editar Usuário</h1>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <img src="/images/patinha.png" alt="" className={styles.pawIcon} />
          </span>
          <label className={styles.fieldLabel}>
            <div className={styles.inputInner}>
              <input
                className={styles.input}
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Nome"
              />
            </div>
          </label>
        </div>

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <img src="/images/patinha.png" alt="" className={styles.pawIcon} />
          </span>
          <label className={styles.fieldLabel}>
            <div className={styles.inputInner}>
              <input
                className={styles.input}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email"
              />
            </div>
          </label>
        </div>

        <div className={styles.inputWrapper}>
          <span className={styles.icon} aria-hidden>
            <FaPaw />
          </span>
          <label className={styles.fieldLabel}>
            <div className={styles.inputInner}>
              <input
                className={styles.input}
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="Telefone"
              />
            </div>
          </label>
        </div>

        <div className={styles.inputRow}>
          <div className={`${styles.inputWrapper} ${styles.halfInput}`}>
            <span className={styles.icon} aria-hidden>
              <img src="/images/patinha.png" alt="" className={styles.pawIcon} />
            </span>
            <label className={styles.fieldLabel}>
              <div className={styles.inputInner}>
                <input
                  className={styles.input}
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Senha"
                />
              </div>
            </label>
          </div>
        </div>

        <div className={styles.uploadWrapper}>
          <div className={styles.uploadImagem}>
            <label htmlFor="usuario-imagem">
              <div className={styles.uploadBox}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className={styles.uploadPreview}
                  />
                ) : (
                  <>
                    <img
                      src="/images/iconephoto.png"
                      className={styles.iconeAddImg}
                      alt="Adicionar"
                    />
                    <span className={styles.uploadText}>Adicionar imagem</span>
                  </>
                )}
              </div>
            </label>

            <input
              id="usuario-imagem"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.deleteBtn}
            disabled={isLoading}
            onClick={handleDeleteAccount}
          >
            Excluir conta
          </button>

          <button className={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </div>
  );
}