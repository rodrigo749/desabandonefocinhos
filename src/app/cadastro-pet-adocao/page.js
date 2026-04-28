"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./adocao.module.css";
import useSafeToast from "@/components/Toast/useSafeToast";

export default function CadastroAdocao() {
  const { showToast } = useSafeToast();
  const router = useRouter();

  // --- ESTADOS DE CONTROLE ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagemFile, setImagemFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    idade: "",
    descricao: "",
    imagemPreview: "",
  });

  // --- PROTEÇÃO DE ROTA ---
  useEffect(() => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (!usuarioLogado) {
      showToast("Acesso restrito. Redirecionando para login...", "warning");
      router.push("/login-usuario");
    } else {
      setIsAuthorized(true);
    }
  }, [router, showToast]);

  // --- HELPERS ---
  const getBaseUrl = useCallback(() => {
    return (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
      .trim()
      .replace(/\/$/, "");
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  // --- TRATAMENTO DE IMAGEM ---
  const handleImagem = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Validação de Tamanho (5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      showToast("Imagem muito grande. O limite é 5MB.", "warning");
      return;
    }

    // Validação de Tipo
    if (!arquivo.type.startsWith("image/")) {
      showToast("Por favor, selecione um arquivo de imagem válido.", "warning");
      return;
    }

    setImagemFile(arquivo);
    const previewUrl = URL.createObjectURL(arquivo);
    setFormData((prev) => ({ ...prev, imagemPreview: previewUrl }));
  };

  // Cleanup do Blob para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (formData.imagemPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(formData.imagemPreview);
      }
    };
  }, [formData.imagemPreview]);

  // --- SUBMISSÃO ---
  const salvarPet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Validação Front-end rápida
    if (!formData.nome.trim()) {
      setFieldErrors((prev) => ({ ...prev, nome: "O nome do pet é obrigatório." }));
      setLoading(false);
      return;
    }

    try {
      const storageData = localStorage.getItem("usuarioLogado");
      const usuario = storageData ? JSON.parse(storageData) : null;

      if (!usuario?.id) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const fd = new FormData();
      fd.append("name", formData.nome.trim());
      fd.append("species", formData.especie);
      fd.append("breed", formData.raca.trim());
      fd.append("age", formData.idade);
      fd.append("description", formData.descricao.trim());
      fd.append("status", "available"); // Status fixo para adoção
      fd.append("userId", usuario.id);

      if (imagemFile) {
        fd.append("image", imagemFile);
      }

      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "POST",
        body: fd,
        // Se usar Token JWT, adicione aqui:
        // headers: { "Authorization": `Bearer ${usuario.token}` }
      });

      const respData = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = respData?.message || "Erro ao cadastrar pet.";
        showToast(msg, "error");
        setLoading(false);
        return;
      }

      showToast("Pet cadastrado para adoção!", "success");
      
      // Pequeno delay para o usuário ler o toast antes do redirect
      setTimeout(() => router.push("/seus-pets-para-adocao"), 1000);

    } catch (err) {
      showToast(err.message || "Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Bloqueio de renderização para não-autorizados
  if (!isAuthorized) {
    return (
      <div className={styles.loadingScreen}>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <main className={styles.cadastroPetContainer}>
      <div className={styles.adocaoContainer}>
        
        {/* COLUNA ESQUERDA: Imagem e Descrição */}
        <section className={styles.leftSide}>
          <div className={styles.uploadImagem}>
            <label htmlFor="pet-imagem" className={styles.uploadLabel}>
              <div className={styles.uploadBox}>
                {formData.imagemPreview ? (
                  <img src={formData.imagemPreview} alt="Preview" className={styles.previewImagem} />
                ) : (
                  <>
                    <img src="/images/iconephoto.png" alt="Add" className={styles.iconeAddImg} />
                    <span>Adicionar imagem</span>
                  </>
                )}
              </div>
            </label>
            <input
              type="file"
              id="pet-imagem"
              accept="image/*"
              hidden
              onChange={handleImagem}
              disabled={loading}
            />
          </div>

          <div className={styles.campoDescricao}>
            <img src="/images/patinha.png" alt="" className={styles.iconeDescricao} />
            <textarea
              className={styles.descricaoTextarea}
              placeholder="Conte um pouco sobre a personalidade do pet, temperamento e por que ele está para adoção..."
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              disabled={loading}
            />
          </div>
        </section>

        {/* COLUNA DIREITA: Formulário */}
        <section className={styles.rightSide}>
          <h2 className={styles.tituloCadastro}>Cadastro Pet Adoção</h2>

          <form className={styles.formCadastro} onSubmit={salvarPet}>
            
            <div className={styles.campo} style={fieldErrors.nome ? { borderColor: "red" } : {}}>
              <img src="/images/patinha.png" className={styles.iconeInput} alt="" />
              <input
                type="text"
                placeholder="Nome do Pet"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                disabled={loading}
              />
            </div>
            {fieldErrors.nome && <span className={styles.errorText}>{fieldErrors.nome}</span>}

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} alt="" />
              <select
                value={formData.especie}
                onChange={(e) => handleChange("especie", e.target.value)}
                className={!formData.especie ? styles.selectPlaceholder : ""}
                disabled={loading}
              >
                <option value="" disabled>Selecione a espécie</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} alt="" />
              <input
                type="text"
                placeholder="Raça"
                value={formData.raca}
                onChange={(e) => handleChange("raca", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={`${styles.campo} ${styles.campoIdade}`}>
              <img src="/images/patinha.png" className={styles.iconeInput} alt="" />
              <input
                type="number"
                placeholder="Idade (anos)"
                value={formData.idade}
                onChange={(e) => handleChange("idade", e.target.value)}
                min="0"
                className={styles.inputIdade}
                disabled={loading}
              />
              <div className={styles.botoesIdade}>
                <button
                  type="button"
                  className={styles.btnIdade}
                  onClick={() => handleChange("idade", String((parseInt(formData.idade) || 0) + 1))}
                  disabled={loading}
                >▲</button>
                <button
                  type="button"
                  className={styles.btnIdade}
                  onClick={() => {
                    const val = (parseInt(formData.idade) || 0);
                    if (val > 0) handleChange("idade", String(val - 1));
                  }}
                  disabled={loading}
                >▼</button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnCadastrar}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Processando..." : "CADASTRAR PET"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}