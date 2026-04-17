'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSafeToast from "@/components/Toast/useSafeToast";
import styles from "./perdidos.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CadastrarPerdidos() {
  const router = useRouter();
  const { showToast } = useSafeToast();

  // --- ESTADOS ---
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagemFile, setImagemFile] = useState(null);
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

  // --- PROTEÇÃO DE ROTA (CLIENT-SIDE) ---
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
  };

  // --- TRATAMENTO DE IMAGEM ---
  const handleImagem = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Validação Sênior: Tamanho e Tipo
    if (arquivo.size > 5 * 1024 * 1024) {
      return showToast("A imagem deve ter no máximo 5MB", "warning");
    }

    setImagemFile(arquivo);
    const previewUrl = URL.createObjectURL(arquivo);
    setFormData((prev) => ({ ...prev, imagemPreview: previewUrl }));
  };

  // Limpeza de memória para o Blob da imagem
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
    
    // Validação básica antes de enviar
    if (!formData.name || !formData.species || !imagemFile) {
      return showToast("Preencha os campos obrigatórios e adicione uma foto.", "warning");
    }

    setLoading(true);

    try {
      const storageData = localStorage.getItem("usuarioLogado");
      const usuarioLogado = storageData ? JSON.parse(storageData) : null;

      if (!usuarioLogado?.id) {
        throw new Error("Sessão inválida. Faça login novamente.");
      }

      // Preparação do FormData (Necessário para envio de arquivos/Multipart)
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("species", formData.species);
      fd.append("breed", formData.breed);
      fd.append("gender", formData.genero);
      fd.append("age", formData.age);
      fd.append("dateLost", formData.dateLost);
      fd.append("location", formData.location);
      fd.append("reward", formData.reward.toString());
      fd.append("description", formData.description);
      fd.append("status", "lost");
      fd.append("userId", usuarioLogado.id);
      fd.append("image", imagemFile); // O Multer no backend lerá este campo

      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "POST",
        body: fd,
        // Se usar JWT, descomente a linha abaixo:
        // headers: { "Authorization": `Bearer ${usuarioLogado.token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao cadastrar pet");
      }

      showToast("Pet cadastrado com sucesso!", "success");
      router.push("/meus-pets-perdidos");
      
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Se não estiver autorizado, não renderiza nada para evitar "flash" de conteúdo privado
  if (!isAuthorized) return <div className={styles.loadingScreen}>Carregando...</div>;

  return (
    <main className={styles.cadastroPetContainer}>
      <div className={styles.adocaoContainer}>
        
        {/* COLUNA ESQUERDA: Upload e Descrição */}
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
            <img src="/images/patinha.png" alt="patinha" className={styles.iconeDescricao} />
            <textarea
              placeholder="Descreva as características do pet, onde foi visto por último..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={styles.descricaoTextarea}
              disabled={loading}
            />
          </div>
        </section>

        {/* COLUNA DIREITA: Formulário Detalhado */}
        <section className={styles.rightSide}>
          <h2 className={styles.tituloCadastro}>Cadastrar Pet Perdido</h2>

          <form className={styles.formCadastro} onSubmit={salvarPet}>
            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} alt="" />
              <input
                type="text"
                placeholder="Nome do Pet"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className={styles.gridCampos}>
              <div className={styles.campo}>
                <select 
                  value={formData.species} 
                  onChange={(e) => handleChange("species", e.target.value)}
                  required
                >
                  <option value="">Espécie</option>
                  <option value="dog">Cachorro</option>
                  <option value="cat">Gato</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className={styles.campo}>
                <select 
                  value={formData.genero} 
                  onChange={(e) => handleChange("genero", e.target.value)}
                >
                  <option value="">Gênero</option>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
              </div>
            </div>

            <div className={styles.campo}>
              <input
                type="text"
                placeholder="Raça (Ex: Poodle, SRD...)"
                value={formData.breed}
                onChange={(e) => handleChange("breed", e.target.value)}
              />
            </div>

            <div className={styles.campo}>
              <input
                type="text"
                placeholder="Localização (Bairro/Cidade)"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>

            <div className={styles.campo}>
              <label className={styles.labelData}>Data do desaparecimento:</label>
              <input
                type="date"
                value={formData.dateLost}
                onChange={(e) => handleChange("dateLost", e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.recompensaBox}>
              <div className={styles.sliderHeader}>
                <span>Recompensa: <strong>R$ {formData.reward}</strong></span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={formData.reward}
                onChange={(e) => handleChange("reward", e.target.value)}
                className={styles.slider}
              />
            </div>

            <button 
              type="submit" 
              className={styles.btnCadastrar}
              disabled={loading}
            >
              {loading ? "Processando..." : "PUBLICAR ANÚNCIO"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}