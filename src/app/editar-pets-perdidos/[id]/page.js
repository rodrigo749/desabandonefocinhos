"use client";

import { useState, useEffect } from "react";
import useSafeToast from "@/components/Toast/useSafeToast";
import { useRouter, useParams } from "next/navigation";
import styles from "../editarpetperdidos.module.css";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

export default function EditarPetPerdidosId() {
  const router = useRouter();
  const { id } = useParams();

  // Nota: acesso público permitido — não exige login para editar (controle de permissão removido)

  const [formData, setFormData] = useState({
    nome: "",
    raca: "",
    genero: "",
    local: "",
    data: "",
    descricao: "",
    recompensa: 0,
    imagem: "",
  });

  const [imagemFile, setImagemFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { showToast } = useSafeToast();

  useEffect(() => {
    async function carregarPet() {
      if (!id) return;
      try {
        const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          console.error("Erro ao buscar pet perdido:", res.status);
          setCarregando(false);
          return;
        }
        const pet = await res.json();
  // Permitir edição por qualquer visitante; não há bloqueio client-side de dono

        setFormData({
          nome: pet.nome || pet.name || "",
          raca: pet.raca || pet.breed || "",
          genero: pet.genero || pet.gender || "",
          local: pet.local || pet.location || "",
          data: pet.data || pet.dateLost || "",
          descricao: pet.descricao || pet.description || "",
          recompensa: pet.recompensa || pet.reward || 0,
          imagem: pet.imagem || pet.image || "",
        });
        setPreview(pet.imagem || pet.image || null);
      } catch (err) {
        console.error("Erro ao carregar pet:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarPet();
  }, [id]);

  const handleFocus = (e) => {
    e.target.dataset.placeholder = e.target.placeholder;
    e.target.placeholder = "";
  };

  const handleBlur = (e) => {
    e.target.placeholder = e.target.dataset.placeholder;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagem = (e) => {
    const arquivo = e.target.files?.[0] || null;
    setImagemFile(arquivo);
    if (arquivo) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(arquivo);
    } else {
      setPreview(null);
    }
  };

  const salvarEdicao = async (e) => {
    e?.preventDefault?.();
    if (!id) {
      setStatusMessage("ID não disponível");
      return;
    }

    try {
      setLoading(true);

      // Usar FormData para enviar imagem + dados juntos
      const fd = new FormData();
      fd.append("name", formData.nome || "");
      fd.append("breed", formData.raca || "");
      fd.append("gender", formData.genero || "");
      fd.append("location", formData.local || "");
      fd.append("dateLost", formData.data || "");
      fd.append("description", formData.descricao || "");
      fd.append("reward", formData.recompensa || "0");

      if (imagemFile) {
        fd.append("image", imagemFile);
      }

  const payload = {
        name: formData.nome,
        breed: formData.raca,
        gender: formData.genero,
        location: formData.local,
        dateLost: formData.data,
        description: formData.descricao,
        reward: Number(formData.recompensa) || 0,
        image: imagemURL || "",
      };

      const logged = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      const headers = {};
      if (logged && logged.id) headers['x-usuario-id'] = String(logged.id);
      const token = localStorage.getItem("token") || "";
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, {
        method: "PUT",
        headers,
        body: fd,
      });

  if (!res.ok) throw new Error("Falha ao salvar");
  showToast("Pet atualizado com sucesso!", "success");
  router.push("/perdidos");
    } catch (err) {
      console.error(err);
  showToast(err.message || "Erro ao salvar", "error");
    } finally {
      setLoading(false);
    }
  };

  const excluirPet = async () => {
    if (!id) return setStatusMessage("ID não disponível");
    setShowConfirm(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    try {
      setLoading(true);
      const logged = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      const delHeaders = {};
      if (logged && logged.id) delHeaders['x-usuario-id'] = String(logged.id);
      const token = localStorage.getItem("token") || "";
      if (token) delHeaders['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, { method: "DELETE", headers: delHeaders });
      if (!res.ok) throw new Error("Falha ao remover");
      showToast("Pet excluído com sucesso!", "success");
      setTimeout(() => router.push("/perdidos"), 800);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Erro ao excluir", "error");
    } finally {
      setLoading(false);
    }
  };

  if (carregando) return <p style={{ color: '#fff', textAlign: 'center' }}>Carregando pet...</p>;

  return (
    <>
    <main className={styles.cadastroPetContainer}>
      <div className={styles.cadastroWrapper}>

        <section className={styles.colEsquerda}>
          <div className={styles.uploadImagem}>
            <label htmlFor="pet-imagem">
              <div className={styles.uploadBox}>
                {preview ? (
                  <img src={preview} alt="preview" className={styles.uploadPreview} />
                ) : (
                  <>
                    <img src="/images/iconephoto.png" className={styles.iconeAddImg} />
                    <span className={styles.uploadText}>Adicionar imagem</span>
                  </>
                )}
              </div>
            </label>
            <input type="file" id="pet-imagem" hidden accept="image/*" onChange={handleImagem} />
          </div>

          <div className={styles.descricaoBox}>
            <label className={styles.descLabel}>
              <img src="/images/patinha.png" className={styles.descIcon} />
              Descrição:
            </label>
            <textarea
              name="descricao"
              className={styles.descricaoTextarea}
              placeholder="Descreva o pet aqui..."
              rows="8"
              value={formData.descricao}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
            ></textarea>
          </div>
        </section>

        <section className={styles.colDireita}>
          <div className={styles.tituloArea}>
            <h2 className={styles.tituloCadastro}>Editar Pet Perdido</h2>
          </div>

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

            <div className={styles.campo} style={/* style kept for error highlighting */ {}}>
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

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="text"
                name="local"
                placeholder="Local"
                value={formData.local}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>

            <div className={styles.campo}>
              <img src="/images/patinha.png" className={styles.iconeInput} />
              <input
                type="date"
                name="data"
                placeholder="Data"
                value={formData.data}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
              />
            </div>

            <div className={styles.recompensaBox}>
              <div className={styles.recompensaWrapper}>
                <div className={styles.recompensaLabelWrapper}>
                  <label className={styles.recompensaLabel}>Recompensa</label>
                </div>
                <div className={styles.recompensaRow}>
                  <img src="/images/patinha.png" className={styles.iconeRecompensa} />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    name="recompensa"
                    value={formData.recompensa}
                    onChange={(e) => setFormData((p) => ({ ...p, recompensa: Number(e.target.value) }))}
                    className={styles.slider}
                  />
                  <span className={styles.valorRecompensa}>R$ {formData.recompensa}</span>
                </div>
              </div>
            </div>

            {statusMessage && (
              <div style={{ textAlign: 'center', color: '#285a78', fontWeight: 700, marginTop: 8 }}>{statusMessage}</div>
            )}

            <div className={styles.actionsRow}>
              <button type="submit" className={styles.btnEditar} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
              <button type="button" className={styles.btnExcluir} onClick={excluirPet} disabled={loading}>{loading ? '...' : 'Excluir'}</button>
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
