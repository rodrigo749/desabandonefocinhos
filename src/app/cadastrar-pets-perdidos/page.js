'use client'

import { useState, useEffect } from "react";
import useSafeToast from "@/components/Toast/useSafeToast";
import { useRouter } from "next/navigation";
import styles from "./perdidos.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CadastrarPerdidos() {
  const router = useRouter();
  const { showToast } = useSafeToast();

  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    genero: "",
    age: "",
    location: "",
    dateLost: "",
    description: "",
    reward: 0,
    imagemPreview: "",
  });

  const [imagemFile, setImagemFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const getBaseUrl = () =>
    (process.env.NEXT_PUBLIC_PETZ_API_URL ||
      `http://localhost:${process.env.PORT || 3000}`)
      .trim()
      .replace(/\/$/, "");

  // ================= UPLOAD =================
  const uploadImage = async (imagem) => {
    const baseUrl = getBaseUrl();
    const fd = new FormData();
    fd.append("imagem", imagem);

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) throw new Error("Erro no upload");

    const data = await res.json();
    return data.url;
  };

  // ================= IMAGEM =================
  const handleImagem = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const maxMB = 5;
    if (arquivo.size > maxMB * 1024 * 1024) {
  showToast(`Imagem maior que ${maxMB}MB`, "warning");
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
  showToast("Arquivo inválido", "warning");
      return;
    }

    setImagemFile(arquivo);

    // preview local imediato
    const previewUrl = URL.createObjectURL(arquivo);

    setFormData((prev) => ({
      ...prev,
      imagemPreview: previewUrl,
    }));
  };

  // ================= FOCUS/BLUR HANDLERS =================
  const handleFocus = (e) => {
    e.target.dataset.placeholder = e.target.placeholder;
    if (e.target.type !== "range" && e.target.type !== "date") {
      e.target.placeholder = "";
    }
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.dataset.placeholder || "";
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
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

  // ================= SALVAR PET =================
const salvarPet = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !usuarioLogado.id) {
      showToast("Usuário não está logado.", "warning");
      setLoading(false);
      return;
    }

    // Usar FormData para enviar imagem + dados juntos
    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("species", formData.species || "");
    fd.append("breed", formData.breed || "");
    fd.append("gender", formData.genero || "");
    fd.append("age", formData.age || "");
    fd.append("dateLost", formData.dateLost || "");
    fd.append("location", formData.location || "");
    fd.append("reward", formData.reward || "0");
    fd.append("description", formData.description || "");
    fd.append("status", "lost");
    fd.append("userId", usuarioLogado.id);

    if (imagemFile) {
      fd.append("image", imagemFile);
    }

    const res = await fetch(`${getBaseUrl()}/api/pets`, {
      method: "POST",
      body: fd,
    });

    const respData = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Erro backend:", respData);
      const msg = respData?.message || respData?.error || respData?.raw || "Erro ao cadastrar pet";
      showToast(msg, "error");
      setLoading(false);
      return;
    }

    showToast("Pet cadastrado com sucesso!", "success");
    setFormData({
      name: "",
      species: "",
      breed: "",
      genero: "",
      age: "",
      location: "",
      dateLost: "",
      description: "",
      reward: 0,
      imagemPreview: "",
    });

    setImagemFile(null);
    router.push("/meus-pets-perdidos");
  } catch (error) {
    console.error(error);
    showToast(error.message || "Erro ao cadastrar pet", "error");
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
                    alt="Preview"
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
              placeholder="Descreva o pet aqui..."
              value={formData.descdescriptionricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={styles.descricaoTextarea}
            />
          </div>
        </section>

        {/* COLUNA DIREITA */}
        <section className={styles.rightSide}>
          <h2 className={styles.tituloCadastro}>Cadastrar Pet Perdido</h2>

          <form className={styles.formCadastro} onSubmit={salvarPet}>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <select
                value={formData.species}
                onChange={(e) => handleChange("species", e.target.value)}
              >
                <option value="" disabled>Selecione a espécie</option>
                <option value="dog">Cachorro</option>
                <option value="cat">Gato</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                placeholder="Raça"
                value={formData.breed}
                onChange={(e) => handleChange("breed", e.target.value)}
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
                placeholder="Idade(anos)"
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

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                placeholder="Localização"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="date"
                value={formData.dateLost}
                onChange={(e) => handleChange("dateLost", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={styles.dateInput}
              />
              <svg 
                className={styles.calendarIcon}
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>

            <div className={styles.campoRecompensa}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <div className={styles.sliderContainer}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Recompensa:</span>
                  <span className={styles.valorRecompensa}>R$ {formData.reward}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={formData.reward}
                  onChange={(e) => handleChange("reward", e.target.value)}
                  className={styles.slider}
                />
                <div className={styles.sliderMinMax}>
                  <span>R$ 0</span>
                  <span>R$ 1.000</span>
                </div>
              </div>
            </div>
            

            <button 
              type="submit" 
              disabled={loading}
              className={styles.btnCadastrar}
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
