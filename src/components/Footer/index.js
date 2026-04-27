import { FaFacebook, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <p className={styles.subtitle}>
          Siga nossas redes
        </p>

        <div className={styles.icons}>
          <a
            href="https://www.facebook.com/DesabandoneFocinhoos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>

          <a
            href="https://www.instagram.com/desabandonefocinhos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>

        <p className={styles.text}>
          © 2026 Patas Perdidas. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}