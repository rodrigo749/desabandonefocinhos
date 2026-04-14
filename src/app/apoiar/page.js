"use client";

import styles from "./apoiar.module.css";

export default function ApoiarPage() {
const copyEmail = () => {
  const text = document.querySelector(`.${styles.scanChave}`).innerText;
  navigator.clipboard.writeText(text);
};

return (
<main className={styles["apoiar-page"]}> <link
   />

  <section className={styles.heroContent}>
    <div className={styles.leftColumn}>
      <div className={styles.textBlock}>
        <h1 className={styles.topLeftMessage}>Ajude nossos pets!</h1>
        <p className={styles.topLeft2Message}>
          sua doação mantém nossos resgates ativos.
        </p>
      </div>

      <div className={styles.qrBlock}>
        <p className={styles.scanText}>Escaneie para apoiar</p>

        <div className={styles.qrImage}>
          <img src="/images/QR.png" alt="QR Code para doação" />
        </div>

        <div className={styles["email-container"]}>
          <div className={styles.scanChave}>carolbazoli@gmail.com</div>

          <button
            className={styles["copy-button"]}
            onClick={copyEmail}
            type="button"
          >
            Copiar Chave
          </button>
        </div>
      </div>
    </div>

    <div className={styles.rightColumn}>
      <div className={styles.petIllustration}>
        <div className={styles["dogs-image"]}>
          <img src="/images/Dogs.png" alt="Cachorro e gato" />
        </div>
      </div>
    </div>
  </section>
</main>

);
}
