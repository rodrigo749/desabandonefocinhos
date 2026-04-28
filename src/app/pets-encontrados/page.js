"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard/PetCard";
import styles from "./pets-encontrados.module.css";
import { getApiUrl } from '@/lib/apiUrl'

const getBaseUrl = () => getApiUrl();

export default function PetsEncontrados() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarPets() {
    try {
      setLoading(true);
      setErro("");

      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao buscar pets");

      const data = await res.json();
      const listaPets = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

      // Filtrar apenas pets encontrados/achados
      const encontrados = listaPets.filter(
        (pet) => pet.status === "encontrado" || pet.status === "achado" || pet.status === "found"
      );

      setPets(encontrados);
    } catch (error) {
      console.error("Erro ao carregar pets encontrados:", error);
      setErro("Não foi possível carregar os pets encontrados.");
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
        <h1 className={styles.titulo}>Pets Encontrados</h1>

        {loading && <p>Carregando pets...</p>}
        {erro && <p>{erro}</p>}

        {!loading && !erro && (
          <section className={styles["grid-pets"]}>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} tipoPagina="encontrados" />
              ))
            ) : (
              <p>Nenhum pet encontrado no momento.</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
