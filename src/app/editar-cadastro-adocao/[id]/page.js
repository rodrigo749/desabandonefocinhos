"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "../editaradocao.module.css";

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
    raca: "",
    genero: "",
    idade: "",
    descricao: "",
    imagemPreview: "",
  });

  const [imagemFile, setImagemFile] = useState(null);
  const [carregando, setCarregando] = useState(true);

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

        setFormData({
          nome: pet.nome || pet.name || "",
          raca: pet.raca || pet.breed || "",
          genero: pet.genero || pet.gender || "",
          idade: pet.idade ?? pet.age ?? "",
          descricao: pet.descricao || pet.description || "",
          imagemPreview: getImageUrl(pet),
        });
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

      alert("Pet atualizado com sucesso!");
      router.push("/seus-pets-para-adocao");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao salvar edição do pet.");
    }
  };

  const excluirPet = async () => {
    if (!confirm("Tem certeza que deseja excluir este pet?")) return;

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

      alert("Pet excluído com sucesso!");
      router.push("/seus-pets-para-adocao");
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      alert("Erro ao excluir pet.");
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

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                name="genero"
                placeholder="Gênero"
                value={formData.genero}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                name="idade"
                placeholder="Idade"
                value={formData.idade}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
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
  );
}