"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard/PetCard";
import styles from "./pets-perdidos.module.css";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

export default function PetsPerdidos() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // ================= CARREGAR PETS =================
  async function carregarPets() {
    try {
      setLoading(true);
      setErro("");

      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar pets");
      }

      const data = await res.json();

      // backend retorna { pets }
      const listaPets = Array.isArray(data.pets) ? data.pets : [];

      // filtrar apenas pets perdidos
      const petsPerdidos = listaPets.filter(
        (pet) => pet.status === "lost" || pet.status === "perdido"
      );

      setPets(petsPerdidos);
    } catch (error) {
      console.error("Erro ao carregar pets:", error);
      setErro("Não foi possível carregar os pets perdidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPets();
  }, []);
  // ================= CARREGAR AO ABRIR PÁGINA =================

  return (
    <main className={styles["pets-page"]}>
      <div className={styles["cards-wrapper-container"]}>
        <h1 className={styles.titulo}>Pets Perdidos</h1>

        {loading && <p>Carregando pets...</p>}

        {erro && <p>{erro}</p>}

        {!loading && !erro && (
          <section className={styles["grid-pets"]}>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  tipoPagina="perdidos"
                />
              ))
            ) : (
              <p>Nenhum pet perdido no momento.</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}