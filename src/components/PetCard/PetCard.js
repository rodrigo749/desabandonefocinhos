"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ModalPet from "@/components/ModalPet/ModalPet";
import styles from "./PetCard.module.css";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

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
  const nomeTruncado = nome.length > 20 ? `${nome.slice(0, 20)}...` : nome;
  const imagem = pet.imagem || pet.image || "/images/semfoto.jpg";
  const especie = pet.especie || pet.species || "Não informada";
  const raca = pet.raca || pet.breed || "Não informada";
  const genero = pet.genero || pet.gender || "Não informado";
  const idade = pet.idade || pet.age || "Não informada";
  const localizacao = pet.localizacao || pet.location || "Não informada";
  const data = pet.data || pet.updated || pet.updatedAt || "Sem data";
  const descricao = pet.descricao || pet.description || "Sem descrição";
  const descricaoCurta = descricao.length > 60 ? `${descricao.slice(0, 60)}...` : descricao;
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
            <h3>{nomeTruncado}</h3>
            
            {/* INFO PARA ADOÇÃO */}
            {tipoPagina === "publica" && (
              <>
                <p>Espécie: {especie}</p>
                <p>Raça: {raca}</p>
                <p>Gênero: {genero}</p>
                <p>Idade: {idade}</p>
                <p><strong>Descrição:</strong> {descricaoCurta}</p>
              </>
            )}


            {/* INFO PARA PETS PERDIDOS */}
            {tipoPagina === "perdidos" && (
              <>
                <p>Espécie: {especie}</p>
                <p>Gênero: {genero}</p>
                <p>Idade: {idade}</p>
                <p>Localização: {localizacao}</p>
                <p>Data: {data}</p>
                <p><strong>Descrição:</strong> {descricaoCurta}</p>
              </>
            )}


            {/* INFO PARA MEUS PETS PERDIDOS (usuario) */}
            {tipoPagina === "usuario" && (
              <>
                <p>Espécie: {especie}</p>
                <p>Gênero: {genero}</p>
                <p>Idade: {idade}</p>
                <p>Localização: {localizacao}</p>
                <p>Data: {data}</p>
                <p><strong>Descrição:</strong> {descricaoCurta}</p>
              </>
            )}

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

          {tipoPagina === "usuario" && ehDoUsuario && (
            <div className={styles["actions-wrapper"]}>
              <button
                className={styles["btn-adotado"]}
                onClick={marcarComoAdotado}
              >
                Adotado
              </button>

              <Link href={`/editar-cadastro-adocao/${id}`}>
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