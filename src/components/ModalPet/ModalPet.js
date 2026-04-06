"use client";

import { useState } from "react";
import styles from "./ModalPet.module.css";
import ModalLogin from "@/components/ModalLogin/ModalLogin";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

// Função para obter URL da imagem (BLOB ou URL direta)
const getImageUrl = (pet) => {
  if (pet.hasImage) {
    return `${getBaseUrl()}/api/pets/${pet.id}/image`;
  }
  return pet.imagem || pet.image || "/images/default.png";
};

export default function ModalPet({ pet, onClose }) {
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const imagemUrl = getImageUrl(pet);

  return (
    <>
<div className={styles.overlay} onClick={handleBackgroundClick}>
  <div className={styles.modal}>
    

    <div className={styles.modalContent}>
      {/* BOTÃO DE FECHAR */}
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

          {/* LEFT SIDE - IMAGE */}
          <div className={styles.imageBox}>
            <img src={imagemUrl} alt={pet.name} />
            <h2 className={styles.petName}>{pet.name}</h2>
          </div>

          {/* RIGHT SIDE - BLUE BOX */}
          <div className={styles.infoBox}>
            {/* Top area with updated text and reward badge */}
            <div className={styles.topMeta}>
              <div className={styles.updatedText}>
                {pet.updated || pet.updatedAt || "Updated 2 weeks ago"}
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

            {/* Paw icon */}
            <img
              src="/images/paw.png"
              alt="paw"
              className={styles.pawIcon}
            />

            <div className={styles.infoColumns}>
              <div className={styles.infoGroup}>
                <p>
                  <strong>Breed:</strong> {pet.breed}
                </p>
                <p>
                  <strong>Gender:</strong> {pet.gender}
                </p>
                <p>
                  <strong>Location:</strong> {pet.location}
                </p>
                <p>
                  <strong>Date:</strong> {pet.date || "-"}
                </p>
              </div>

              <div className={styles.respEndGroup}>
                <p>
                  <strong>Reward:</strong> {pet.reward}
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className={styles.descriptionBox}>
              <p className={styles.descLabel}>Description:</p>
              <p className={styles.descText}>{pet.description}</p>
            </div>

        {/* BOTÃO */}
        <button className={styles.contactBtn} onClick={handleContact}>Contatar dono</button>

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
