"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ModalPet from "@/components/ModalPet/ModalPet";
import styles from "./PetCard.module.css";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

// Função para obter URL da imagem (BLOB ou URL direta)
const getImageUrl = (pet) => {
  // Se tem hasImage, usar endpoint de BLOB
  if (pet.hasImage) {
    return `${getBaseUrl()}/api/pets/${pet.id}/image`;
  }
  // Fallback para URL direta ou imagem padrão
  return pet.imagem || pet.image || "/images/default.png";
};

export default function PetCard({ pet, tipoPagina }) {
  const [open, setOpen] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioLogado"));
    setUsuarioLogado(user);
  }, []);

  // aceita tanto português quanto inglês
  const id = pet.id;
  const nome = pet.nome || pet.name || "Sem nome";
  const imagem = getImageUrl(pet);
  const raca = pet.raca || pet.breed || "Não informada";
  const genero = pet.genero || pet.gender || "Não informado";
  const idade = pet.idade || pet.age || "Não informada";
  const descricao = pet.descricao || pet.description || "Sem descrição";
  const userId = pet.usuarioId || pet.userId || null;

  const ehDoUsuario = usuarioLogado && userId === usuarioLogado.id;

async function marcarComoAdotado() {
  try {
    await fetch(`${getBaseUrl()}/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "adotado" }),
    });

    window.location.reload();
  } catch (error) {
    console.error("Erro ao marcar como adotado:", error);
  }
}

async function marcarComoEncontrado() {
  try {
    console.log("Função marcarComoEncontrado foi chamada. ID do pet:", id);

    const res = await fetch(`${getBaseUrl()}/api/pets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "found" }),
    });

    console.log("Resposta HTTP:", res.status);

    const data = await res.json();
    console.log("Resposta da API:", data);

    if (!res.ok) {
      throw new Error("Não foi possível marcar como encontrado.");
    }

    window.location.reload();
  } catch (error) {
    console.error("Erro ao marcar como encontrado:", error);
  }
}

  return (
    <>
      <div className={styles["card-pet"]}>
        <div className={styles["card-image-wrapper"]}>
          <img
            src={imagem}
            alt={nome}
            className={styles["card-image"]}
          />
        </div>

        <div className={styles["content-column"]}>
          <div className={styles["card-text-box"]}>
            <h3>{nome}</h3>
            <p>Raça: {raca}</p>
            <p>Gênero: {genero}</p>
            <p>Idade: {idade}</p>
            <p>Descrição: {descricao}</p>
          </div>

          {tipoPagina === "publica" && (
            <button
              className={styles["btn-adotar"]}
              onClick={() => setOpen(true)}
            >
              Adotar
            </button>
          )}

          {tipoPagina === "perdidos" && (
            <button
              className={styles["btn-adotar"]}
              onClick={() => setOpen(true)}
            >
              Ver
            </button>
          )}

          {(tipoPagina === "usuario" || tipoPagina === "meus-perdidos") && ehDoUsuario && (
            <div className={styles["actions-wrapper"]}>
              <button
                className={styles["btn-adotado"]}
                onClick={
                  tipoPagina === "meus-perdidos"
                    ? marcarComoEncontrado
                    : marcarComoAdotado
                }
              >
                {tipoPagina === "meus-perdidos" ? "Encontrado" : "Adotado"}
              </button>

              <Link href={`/editar-pets-perdidos/${id}`}>
                <button className={styles["btn-editar"]}>Editar</button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {open && (tipoPagina === "publica" || tipoPagina === "perdidos") && (
        <ModalPet pet={pet} onClose={() => setOpen(false)} />
      )}
    </>
  );
}