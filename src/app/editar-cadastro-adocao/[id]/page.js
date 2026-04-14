"use client";

import { useState, useEffect } from "react";
import useSafeToast from "@/components/Toast/useSafeToast";
import { useRouter, useParams } from "next/navigation";
import styles from "../editaradocao.module.css";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

const getImageUrl = (pet) => {
  if (!pet?.id) return "";
  return `${getBaseUrl()}/api/pets/${pet.id}/image`;
};

export default function EditarCadastroAdocao() {
  const router = useRouter();
  const { id: petId } = useParams();

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
  const [carregando, setCarregando] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { showToast } = useSafeToast();

  useEffect(() => {
    async function carregarPet() {
      if (!petId) return;

      try {
        const res = await fetch(`${getBaseUrl()}/api/pets/${petId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Erro ao buscar pet: ${res.status}`);
        }

        const data = await res.json();
        const pet = data.pet || data;

        if (!pet || !pet.id) {
          throw new Error("Pet não encontrado");
        }

        const nomeVal = pet.nome || pet.name || "";
        const especieVal = pet.especie || pet.species || "";
        const racaVal = pet.raca || pet.breed || "";
        const generoVal = pet.genero || pet.gender || "";
        const idadeVal = pet.idade || pet.age || "";
        const descricaoVal = pet.descricao || pet.description || "";
        const imagemVal = pet.imagem || pet.image || null;

        setFormData({
          nome: pet.nome || pet.name || "",
          raca: pet.raca || pet.breed || "",
          genero: pet.genero || pet.gender || "",
          idade: pet.idade ?? pet.age ?? "",
          descricao: pet.descricao || pet.description || "",
          imagemPreview: getImageUrl(pet),
        });
        setPreviewUrl(imagemVal || null);
      } catch (error) {
        console.error("Erro ao carregar pet:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarPet();
  }, [petId]);

  const handleFocus = (e) => {
    e.target.dataset.placeholder = e.target.placeholder;
    e.target.placeholder = "";
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.dataset.placeholder || "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgeChange = (raw) => {
    // allow empty string for controlled input
    if (raw === "") {
      setFormData((p) => ({ ...p, idade: "" }));
      return;
    }
    const num = parseInt(raw, 10);
    if (Number.isNaN(num) || num < 0) return;
    setFormData((p) => ({ ...p, idade: String(num) }));
  };

  const handleImagem = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setImagemFile(arquivo);

    const previewUrl = URL.createObjectURL(arquivo);
    setFormData((prev) => ({
      ...prev,
      imagemPreview: previewUrl,
    }));
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("name", formData.nome || "");
      fd.append("breed", formData.raca || "");
      fd.append("gender", formData.genero || "");
      fd.append("age", formData.idade || "");
      fd.append("description", formData.descricao || "");
      fd.append("status", "available");

      if (imagemFile) {
        fd.append("image", imagemFile);
      }

      const token = localStorage.getItem("token") || "";
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${getBaseUrl()}/api/pets/${petId}`, {
        method: "PUT",
        headers,
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar pet");
      }

  showToast("Pet atualizado com sucesso!", "success");
  router.push("/seus-pets-para-adocao");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
  showToast("Erro ao salvar edição do pet.", "error");
    }
  };

  const excluirPet = async () => {
    // abrir modal para confirmar; fluxo real é executado em handleConfirmDelete
    setShowConfirm(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch(`${getBaseUrl()}/api/pets/${petId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao excluir pet");
      }

      showToast("Pet excluído com sucesso!", "success");
      router.push("/seus-pets-para-adocao");
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      showToast("Erro ao excluir pet.", "error");
    }
  };

  if (carregando) {
    return (
      <p style={{ color: "#fff", textAlign: "center" }}>
        Carregando pet...
      </p>
    );
  }

  return (
    <>
    <main className={styles.cadastroPetContainer}>
      <div className={styles.adocaoContainer}>
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
                      alt="Adicionar imagem"
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
            />
          </div>

          <div className={styles.campoDescricao}>
            <img
              src="/images/patinha.png"
              alt="patinha"
              className={styles.iconeDescricao}
            />

            <textarea
              name="descricao"
              className={styles.descricaoTextarea}
              placeholder="Descreva o pet aqui..."
              value={formData.descricao}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className={styles.rightSide}>
          <h2 className={styles.tituloCadastro}>Editar Pet para Adoção</h2>

          <form className={styles.formCadastro} onSubmit={salvarEdicao}>
            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={formData.nome}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <select
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                className={!formData.especie ? styles.selectPlaceholder : ""}
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
                name="raca"
                placeholder="Raça"
                value={formData.raca}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>
            <div className={styles.campo} style={{ marginTop: 6 }}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={!formData.genero ? styles.selectPlaceholder : ""}
              >
                <option value="" disabled>Selecione o gênero</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>
            
            <div className={`${styles.campo} ${styles.campoIdade}`}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="number"
                name="idade"
                placeholder="Idade"
                value={formData.idade}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => handleAgeChange(e.target.value)}
                min="0"
                className={styles.inputIdade}
              />
              <div className={styles.botoesIdade}>
                <button
                  type="button"
                  className={styles.btnIdade}
                  onClick={() => {
                    const current = parseInt(formData.idade, 10) || 0;
                    handleAgeChange(String(current + 1));
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.btnIdade}
                  onClick={() => {
                    const current = parseInt(formData.idade, 10) || 0;
                    if (current > 0) handleAgeChange(String(current - 1));
                  }}
                >
                  ▼
                </button>
              </div>
            </div>

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
  </main>
  <ConfirmModal
      open={showConfirm}
      title="Excluir pet"
      message="Tem certeza que deseja excluir este pet? Esta ação é irreversível."
      onCancel={() => setShowConfirm(false)}
      onConfirm={handleConfirmDelete}
      confirmLabel="Excluir"
      cancelLabel="Cancelar"
    />
    </>
  );
}