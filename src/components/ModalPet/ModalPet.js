"use client";

import { useState, useEffect } from "react";
import styles from "./ModalPet.module.css";
import ModalLogin from "@/components/ModalLogin/ModalLogin";

export default function ModalPet({ pet, onClose }) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const description = pet?.description ?? "Sem descrição disponível.";
  const localizacao = pet?.localizacao || pet?.location || "Não informada";
  const data = pet?.data || pet?.updated || pet?.updatedAt || "Sem data";
  const contatoDono = pet?.responsavel || pet?.nomeUsuario || "Não informado";
  const telefoneDono = pet?.telefone || pet?.phone || pet?.contato || pet?.whatsapp || "Não disponível";

  function handleBackgroundClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleContact() {
    const user = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const name = pet.responsavel || pet.nomeUsuario || "";
    const phone = pet.telefone || pet.phone || pet.contato || pet.whatsapp || "";
    const phoneDigits = phone.replace(/\D/g, "");

    if (!phoneDigits) {
      alert("Owner's phone number is not available.");
      return;
    }

    const text = `Hello ${ownerName || "owner"}, I'm contacting you through the app about the pet ${pet.name || ""}.`;
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <>
<div className={styles.overlay} onClick={handleBackgroundClick}>
  <div className={styles.modal}>
    <button className={styles.closeBtn} onClick={onClose}>
      &times;
    </button>

    <div className={styles.modalContent}>
          {/* LEFT SIDE - IMAGE */}
          <div className={styles.imageBox}>
            <img src={pet.image || "/images/semfoto.jpg"} alt={pet.name} />
            <h2 className={styles.petName}>{pet.name}</h2>
          </div>

          {/* RIGHT SIDE - BLUE BOX */}
          <div className={styles.infoBox}>
            {/* Top area with updated text and reward badge */}
            <div className={styles.topMeta}>
              <div className={styles.updatedText}>
                {pet.updated || pet.updatedAt || ""}
              </div>

              {pet.reward && Number(pet.reward) > 0 && (
                <div
                  className={styles.rewardBadge}
                  role="status"
                  aria-label={`Reward ${pet.reward} reais`}
                >
            
              
                </div>
              )}
            </div>

          


            <div className={styles.infoColumns}>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Espécie:</strong> {pet.species || pet.especie || "-"}
                </p>
                <p>
                  <strong>Raça:</strong> {pet.breed}
                </p>
                <p>
                  <strong>Genero:</strong> {pet.gender}
                </p>
                <p>
                  <strong>idade:</strong> {pet.age}
                </p>
                {(pet.status === "lost" || pet.status === "perdido") && (
                  <>
                    <p>
                      <strong>Localização:</strong> {localizacao}
                    </p>
                    <p>
                      <strong>Data:</strong> {data}
                    </p>
                  </>
                )}
              </div>
            </div>


            {/* DESCRIPTION */}
            <div className={styles.descriptionBox}>
              <p className={styles.descLabel}>Descrição:</p>
              <p className={styles.descText}>{description}</p>
            </div>

        {/* BOTÃO */}
        <button className={styles.contactBtn} onClick={handleContact}>Contatar</button>


      </div>
    </div>
  </div>
</div>


{showLoginModal && (
        <ModalLogin onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
