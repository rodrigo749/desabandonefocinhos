"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard/PetCard";
import Link from "next/link";
import styles from "./seusPets.module.css";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

export default function SeusPetsParaAdocao() {
  const [pets, setPets] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarPets() {
    try {
      setLoading(true);
      setErro("");

      const user = JSON.parse(localStorage.getItem("usuarioLogado"));
      setUsuarioLogado(user);

      if (!user) {
        setPets([]);
        return;
      }

      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao buscar pets");

      const data = await res.json();
      const listaPets = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

      // Filtrar pets para adoção do usuário logado
      const meusPets = listaPets.filter((pet) => {
        const donoDoPet = pet.userId ?? pet.usuarioId;
        return (
          Number(donoDoPet) === Number(user.id) &&
          (pet.status === "available" || pet.status === "adocao")
        );
      });

      setPets(meusPets);
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setErro("Não foi possível carregar seus pets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
      carregarPets();
    }, []);

  return (
    <main className={styles["pets-page"]}>
      <div className={styles["cards-wrapper-container"]}>
        <h1 className={styles.titulo}>Meus Pets para Adoção</h1>

        {loading && <p>Carregando pets...</p>}
        {erro && <p>{erro}</p>}

        {/* BOTÃO CENTRALIZADO (cadastrar pet para adoção) */}
        <div className={styles.areaBotao}>
          <Link href="/cadastro-pet-adocao" className={styles.botaoCadastrar}>
            + Cadastrar pet
          </Link>
        </div>

        {!loading && !erro && pets.length > 0 && (
          <section className={styles["grid-pets"]}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                tipoPagina="meus-perdidos"
              />
            ))}
          </section>
        )}

        {!loading && !erro && pets.length === 0 && (
          <p className={styles.mensagemCentral}>
            Você não tem pets para adoção registrados.
          </p>
        )}
      </div>
    </main>
  );
}
