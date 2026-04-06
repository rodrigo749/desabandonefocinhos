"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin.module.css";

const API_URL = process.env.NEXT_PUBLIC_PETZ_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Função para obter URL da imagem (BLOB ou URL direta)
const getImageUrl = (pet) => {
  if (pet.hasImage) {
    return `${API_URL}/api/pets/${pet.id}/image`;
  }
  return pet.imagem || pet.image || "/images/semfoto.jpg";
};

export default function AdminPetsPerdidos() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    if (!u || u.tipo !== "admin") {
      router.push("/admin/login");
      return;
    }
    carregarPets();
  }, [router]);

  async function carregarPets() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/pets`, { cache: "no-store" });
      const data = await res.json();
      const lista = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];
      // Filtrar apenas pets com status lost
      const perdidos = lista.filter((p) => p.status === "lost" || p.status === "perdido");
      setPets(perdidos);
    } catch (err) {
      console.error("Erro ao carregar pets perdidos:", err);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id) {
    if (!confirm("Tem certeza que deseja excluir este pet perdido?")) return;

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/pets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.message || "Erro ao excluir pet.");
        return;
      }

      setPets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro de conexão ao excluir pet.");
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando pets perdidos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <h1>Gerenciar Pets Perdidos</h1>

        <div className={styles.topBar}>
          <Link href="/admin" className={styles.btnVoltar}>
            ← Voltar ao Painel
          </Link>
          <Link href="/cadastrar-pets-perdidos" className={styles.btnNovo}>
            + Cadastrar Pet Perdido
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className={styles.empty}>Nenhum pet perdido encontrado.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Raça</th>
                <th>Local</th>
                <th>Recompensa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <img
                      src={getImageUrl(pet)}
                      alt={pet.nome || pet.name}
                    />
                  </td>
                  <td>{pet.nome || pet.name}</td>
                  <td>{pet.raca || pet.breed || "-"}</td>
                  <td>{pet.local || pet.location || "-"}</td>
                  <td>
                    {pet.recompensa || pet.reward
                      ? `R$ ${pet.recompensa || pet.reward}`
                      : "-"}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/editar-pets-perdidos/${pet.id}`}
                        className={styles.btnEditar}
                      >
                        Editar
                      </Link>
                      <button
                        className={styles.btnExcluir}
                        onClick={() => handleExcluir(pet.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
