"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./adocao.module.css";
import useSafeToast from "@/components/Toast/useSafeToast";

export default function CadastroAdocao() {
  const { showToast } = useSafeToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    especie: "",
    raca: "",
    genero: "",
    idade: "",
    descricao: "",
    imagemPreview: "",
  });

  const [imagemFile, setImagemFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ── helpers ──
  const getBaseUrl = () =>
    (process.env.NEXT_PUBLIC_PETZ_API_URL || `http://localhost:${process.env.PORT || 3000}`)
      .trim()
      .replace(/\/$/, "");

  // upload robusto (mesmo padrão do cadastro de usuário)
  const uploadImage = async (file) => {
    if (!file) throw new Error("Nenhum arquivo fornecido");
    if (!file.type || !file.type.startsWith("image/")) throw new Error("Arquivo não é imagem");
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) throw new Error(`Imagem maior que ${maxMB}MB`);

    const baseUrl = getBaseUrl();
    const configs = [
      { url: `${baseUrl}/api/upload`, field: "imagem" },
      { url: `${baseUrl}/upload`, field: "imagem" },
    ];

    let lastErr = null;
    for (const cfg of configs) {
      try {
        const fd = new FormData();
        fd.append(cfg.field, file);
        const res = await fetch(cfg.url, { method: "POST", body: fd });
        const text = await res.text().catch(() => "");
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

        if (!res.ok) {
          lastErr = new Error(data?.message || data?.raw || `Upload falhou (${res.status})`);
          continue;
        }

        const returned =
          data?.url || data?.path || data?.fileUrl || data?.filename ||
          data?.file || data?.file_path || data?.filepath || null;
        if (returned && typeof returned === "string") {
          return returned.startsWith("/") ? `${baseUrl}${returned}` : returned;
        }
        if (typeof data === "string" && data) {
          return data.startsWith("/") ? `${baseUrl}${data}` : data;
        }

        lastErr = new Error("Upload OK mas resposta não contém URL");
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Falha no upload da imagem");
  };

  // ── form handlers ──
  const handleFocus = (e) => {
    e.target.dataset.placeholder = e.target.placeholder;
    e.target.placeholder = "";
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.dataset.placeholder || "";
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleImagem = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const maxMB = 5;
    if (arquivo.size > maxMB * 1024 * 1024) {
      showToast(`Imagem maior que ${maxMB}MB. Escolha outra.`, "warning");
      return;
    }
    if (!arquivo.type || !arquivo.type.startsWith("image/")) {
      showToast("Formato inválido. Escolha uma imagem.", "warning");
      return;
    }

    // revoga preview anterior se blob
    if (formData.imagemPreview && formData.imagemPreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(formData.imagemPreview); } catch {}
    }

    setImagemFile(arquivo);
    setFormData((prev) => ({ ...prev, imagemPreview: URL.createObjectURL(arquivo) }));
  };

  // cleanup blob ao desmontar
  useEffect(() => {
    return () => {
      if (formData.imagemPreview && formData.imagemPreview.startsWith("blob:")) {
        try { URL.revokeObjectURL(formData.imagemPreview); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── submit ──
  const salvarPet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // validações
    if (!formData.nome.trim()) {
      setFieldErrors((prev) => ({ ...prev, nome: "Nome é obrigatório." }));
      setLoading(false);
      return;
    }
    if (!formData.especie) {
      setFieldErrors((prev) => ({ ...prev, especie: "Selecione a espécie." }));
      setLoading(false);
      return;
    }
    // novo campo obrigatório: gênero
    if (!formData.genero) {
      setFieldErrors((prev) => ({ ...prev, genero: "Selecione o gênero." }));
      setLoading(false);
      return;
    }

    // verifica usuário logado
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch {}

    if (!usuario || !usuario.id) {
      showToast("Você precisa estar logado para cadastrar um pet.", "warning");
      setLoading(false);
      return;
    }

    try {
      // Montar FormData para enviar imagem + dados juntos
      const baseUrl = getBaseUrl();
      const fd = new FormData();
      fd.append("name", formData.nome.trim());
      fd.append("species", formData.especie);
      fd.append("breed", formData.raca.trim() || "");
      fd.append("age", formData.idade || "");
      fd.append("description", formData.descricao.trim() || "");
      fd.append("status", "available");
      fd.append("userId", usuario.id);

      if (imagemFile) {
        fd.append("image", imagemFile);
      }

      // Enviar para o backend
      const res = await fetch(`${baseUrl}/api/pets`, {
        method: "POST",
        body: fd,
      });

      const respData = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          respData?.message || respData?.error || respData?.raw ||
          `Erro ao cadastrar pet (status ${res.status})`;

        if (msg.toLowerCase().includes("name")) {
          setFieldErrors((prev) => ({ ...prev, nome: msg }));
        } else if (msg.toLowerCase().includes("species") || msg.toLowerCase().includes("espécie")) {
          setFieldErrors((prev) => ({ ...prev, especie: msg }));
        } else {
          showToast(msg, "error");
        }
        setLoading(false);
        return;
      }

      // 4. sucesso
      console.log("[CadastroPetAdocao] resposta backend:", respData);
      showToast("Pet cadastrado com sucesso!", "success");

      // limpar formulário
      setFormData({
        nome: "",
        especie: "",
        raca: "",
  genero: "",
        idade: "",
        descricao: "",
        imagemPreview: "",
      });
      setImagemFile(null);

      // redirecionar para listagem de pets para adoção após breve delay
      setTimeout(() => router.push("/seus-pets-para-adocao"), 900);
    } catch (err) {
      console.error("Erro geral:", err);
      showToast("Erro de conexão com o servidor. O backend está ligado?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.cadastroPetContainer}>
      <div className={styles.adocaoContainer}>

        {/* COLUNA ESQUERDA */}
        <section className={styles.leftSide}>
          <div className={styles.uploadImagem}>
            <label htmlFor="pet-imagem">
              <div className={styles.uploadBox}>
                {formData.imagemPreview ? (
                  <img
                    src={formData.imagemPreview}
                    alt="Pré-visualização"
                    className={styles.previewImagem}
                  />
                ) : (
                  <>
                    <img
                      src="/images/iconephoto.png"
                      alt="Adicionar"
                      className={styles.iconeAddImg}
                    />
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
            <img
              src="/images/patinha.png"
              alt="patinha"
              className={styles.iconeDescricao}
            />

            <textarea
              className={styles.descricaoTextarea}
              placeholder="Descreva o pet aqui..."
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            ></textarea>
          </div>
        </section>

        {/* COLUNA DIREITA */}
        <section className={styles.rightSide}>
          <h2 className={styles.tituloCadastro}>Cadastro Pet Adoção</h2>

          <form className={styles.formCadastro} onSubmit={salvarPet}>

            <div className={styles.campo} style={fieldErrors.nome ? { borderColor: "red" } : {}}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            {fieldErrors.nome && <span className={styles.errorText}>{fieldErrors.nome}</span>}

            <div className={styles.campo} style={fieldErrors.especie ? { borderColor: "red" } : {}}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <select
                value={formData.especie}
                onChange={(e) => handleChange("especie", e.target.value)}
                className={!formData.especie ? styles.selectPlaceholder : ""}
              >
                <option value="" disabled>Selecione a espécie</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
                <option value="other">Outro</option>
              </select>
            </div>
            {fieldErrors.especie && <span className={styles.errorText}>{fieldErrors.especie}</span>}

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                placeholder="Raça"
                value={formData.raca}
                onChange={(e) => handleChange("raca", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div className={styles.campo} style={fieldErrors.genero ? { borderColor: "red" } : {}}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <select
                value={formData.genero}
                onChange={(e) => handleChange("genero", e.target.value)}
                className={!formData.genero ? styles.selectPlaceholder : ""}
              >
                <option value="" disabled>Selecione o gênero</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
            {fieldErrors.genero && <span className={styles.errorText}>{fieldErrors.genero}</span>}

            <div className={`${styles.campo} ${styles.campoIdade}`}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="number"
                placeholder="Idade (anos)"
                value={formData.idade}
                onChange={(e) => handleChange("idade", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                min="0"
                className={styles.inputIdade}
              />
              <div className={styles.botoesIdade}>
                <button 
                  type="button" 
                  className={styles.btnIdade}
                  onClick={() => {
                    const current = parseInt(formData.idade) || 0;
                    handleChange("idade", String(current + 1));
                  }}
                >
                  ▲
                </button>
                <button 
                  type="button" 
                  className={styles.btnIdade}
                  onClick={() => {
                    const current = parseInt(formData.idade) || 0;
                    if (current > 0) handleChange("idade", String(current - 1));
                  }}
                >
                  ▼
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.btnCadastrar}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </section>

      </div>
    </main>
  );
}
