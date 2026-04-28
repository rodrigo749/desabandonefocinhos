"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard/PetCard";
import styles from "../perdidos.module.css";
import { getApiUrl } from '@/lib/apiUrl'

const getBaseUrl = () => getApiUrl();

export default function PetsPerdidosPage() {
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

      const petsPerdidos = listaPets.filter(
        (p) => p.status === "lost" || p.status === "perdido"
      );

      setPets(petsPerdidos);
    } catch (err) {
      console.error("Erro ao carregar pets perdidos:", err);
      setErro("Não foi possível carregar os pets perdidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPets();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Pets Perdidos</h2>

        {loading && <p>Carregando pets...</p>}
        {erro && <p>{erro}</p>}

        {!loading && !erro && (
          <section className={styles.grid}>
            {pets.length > 0 ? (
              pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} tipoPagina="perdidos" />
              ))
            ) : (
              <p>Nenhum pet perdido encontrado.</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
