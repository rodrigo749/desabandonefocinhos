"use client";
 
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../editarpetperdidos.module.css";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal"; // adicionado

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");


const getImageUrl = (pet) => {
  if (!pet) return "";

  return `${getBaseUrl()}/api/pets/${pet.id}/image`;
};

// simple toast fallback: usa função global se existir, senão alert()
function showToast(message, type = "info") {
  if (typeof window !== "undefined" && typeof window.showToast === "function") {
    try {
      window.showToast(message, type);
      return;
    } catch {}
  }
  // fallback visual simples
  alert(message);
}
    
export default function EditarPetPerdidoPage() {
  const router = useRouter();
  const { id } = useParams();
  
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
    const [showConfirm, setShowConfirm] = useState(false);
  
    // carregar pet existente e preencher formulário
    useEffect(() => {
      async function carregarPet() {
        if (!id) return;
        setLoading(true);
        try {
          const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, {
            cache: "no-store",
          });
          if (!res.ok) {
            console.error("Erro ao buscar pet:", res.status);
            setLoading(false);
            return;
          }
          const data = await res.json();
          const pet = data.pet || data;
  
          setFormData({
            name: pet.name || pet.nome || "",
            species: pet.species || pet.especie || "",
            breed: pet.breed || pet.raca || "",
            genero: pet.gender || pet.genero || "",
            age: pet.age ?? pet.idade ?? "",
            location: pet.location || pet.local || "",
            dateLost: (pet.dateLost || pet.data || "").slice(0, 10),
            description: pet.description || pet.descricao || "",
            reward: pet.reward ?? pet.recompensa ?? 0,
            imagemPreview: pet.image || pet.imagem || getImageUrl(pet) || "",
          });
        } catch (err) {
          console.error("Erro ao carregar pet:", err);
        } finally {
          setLoading(false);
        }
      }
      carregarPet();
    }, [id]);
  
    // cleanup blob ao desmontar
    useEffect(() => {
      return () => {
        if (formData.imagemPreview && formData.imagemPreview.startsWith("blob:")) {
          try { URL.revokeObjectURL(formData.imagemPreview); } catch {}
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
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
  
    // ================= SALVAR PET =================
  const salvarPet = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  
      if (!usuarioLogado || !usuarioLogado.id) {
        showToast("Usuário não está logado.", "warning");
        setLoading(false);
        return;
      }
  
      // validação simples
      if (!formData.name.trim()) {
        setFieldErrors({ name: "Nome obrigatório" });
        setLoading(false);
        return;
      }
  
      // montar payload comum
      const payloadObj = {
        name: formData.name.trim(),
        species: formData.species || "",
        breed: formData.breed || "",
        gender: formData.genero || "",
        age: formData.age || "",
        dateLost: formData.dateLost || "",
        location: formData.location || "",
        reward: Number(formData.reward || 0),
        description: formData.description || "",
        status: "lost",
        userId: String(usuarioLogado.id),
      };
  
      const url = id ? `${getBaseUrl()}/api/pets/${id}` : `${getBaseUrl()}/api/pets`;
      const method = id ? "PUT" : "POST";

      
  
      let res;
  
      if (imagemFile) {
        // enviar multipart quando há imagem
        const fd = new FormData();
        Object.entries(payloadObj).forEach(([k, v]) => fd.append(k, v));
        fd.append("image", imagemFile);
        res = await fetch(url, { method, body: fd });
      } else {
        // enviar JSON quando não há imagem (muitos backends esperam JSON em PUT)
        res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadObj),
        });
      }
  
      const respData = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        console.error("Erro backend:", respData);
        const msg = respData?.message || respData?.error || "Erro ao salvar pet";
        showToast(msg, "error");
        setLoading(false);
        return;
      }
  
      showToast(id ? "Pet atualizado com sucesso!" : "Pet cadastrado com sucesso!", "success");
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
      showToast(error.message || "Erro ao salvar pet", "error");
    } finally {
      setLoading(false);
    }
  };

    const excluirPet = async () => {
    // abrir modal para confirmar; fluxo real é executado em handleConfirmDelete
    setShowConfirm(true);
    };

      const handleConfirmDelete = async () => {
        setShowConfirm(false);

        if (!id) {
          showToast("ID do pet não encontrado", "error");
          return;
        }

        try {
          setLoading(true);

          const token = localStorage.getItem("token") || "";
          const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
          const headers = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          };
          if (usuarioLogado && usuarioLogado.id) {
            headers["x-usuario-id"] = String(usuarioLogado.id);
          }

          const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, {
            method: "DELETE",
            headers,
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.message || "Erro ao excluir pet");
          }

          showToast("Pet excluído com sucesso!", "success");
          router.push("/seus-pets-para-adocao");
        } catch (error) {
          console.error("Erro ao excluir pet:", error);
          showToast(error.message || "Erro ao excluir pet.", "error");
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
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={styles.descricaoTextarea}
              />
            </div>
          </section>
  
          {/* COLUNA DIREITA */}
          <section className={styles.rightSide}>
            <h2 className={styles.tituloCadastro}>{id ? "Editar Pet Perdido" : "Cadastrar Pet Perdido"}</h2>
  
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
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
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
                    const current = parseInt(formData.age) || 0;
                    handleChange("age", String(current + 1));
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.btnIdade}
                  onClick={() => {
                    const current = parseInt(formData.age) || 0;
                    if (current > 0) handleChange("age", String(current - 1));
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
              
  
              {/* substitui o bloco de botões antigo pelo mesmo markup/classes de editaradocao */}
            <div className={styles.botoesEdicao}>
              <button type="submit" className={styles.btnSalvar}>
                Salvar
              </button>
              <button
                type="button"
                className={styles.btnExcluir}
                onClick={excluirPet}
              >
                Excluir
              </button>
            </div>
  
            </form>
          </section>
  
        </div>

        {/* Confirm modal de exclusão */}
        <ConfirmModal
          open={showConfirm}
          title="Excluir pet"
          message="Tem certeza que deseja excluir este pet? Esta ação é irreversível."
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmDelete}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
        />
      </main>
    );
  }
