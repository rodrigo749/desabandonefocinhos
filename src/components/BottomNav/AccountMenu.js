import Link from "next/link";
import {
  RiLoginCircleLine,
  RiUserAddLine,
  RiLogoutCircleRLine,
  RiUser3Line,
} from "react-icons/ri";
import { IoPawOutline } from "react-icons/io5";
import styles from "./bottomNav.module.css";

export function getAccountLinks(usuarioLogado) {
  if (!usuarioLogado) {
    return [
      { label: "Entrar", href: "/login-usuario", Icon: RiLoginCircleLine },
      { label: "Me cadastrar", href: "/cadastro-usuario", Icon: RiUserAddLine },
    ];
  }

  const isAdmin = usuarioLogado?.tipo === "admin";

  return isAdmin
    ? [
        { label: "Painel de Admin", href: "/admin", Icon: RiUser3Line },
        { label: "Gerenciar Pets Perdidos", href: "/admin/pets-perdidos", Icon: IoPawOutline },
        { label: "Gerenciar Pets para Adoção", href: "/admin/pets-adocao", Icon: IoPawOutline },
        { label: "Sair", href: "/logout", Icon: RiLogoutCircleRLine },
      ]
    : [
        { label: "Meu Perfil", href: "/perfil-usuario", Icon: RiUser3Line },
        { label: "Meus Pets Perdidos", href: "/meus-pets-perdidos", Icon: IoPawOutline },
        { label: "Meus Pets para Adoção", href: "/seus-pets-para-adocao", Icon: IoPawOutline },
        { label: "Sair", href: "/logout", Icon: RiLogoutCircleRLine },
      ];
}

export default function AccountMenu({ open, menuRef, onClose, usuarioLogado }) {
  const accountLinks = getAccountLinks(usuarioLogado);

  return (
    <>
      {open && <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Fechar menu" />}

      <aside
        ref={menuRef}
        className={`${styles.accountSheet} ${open ? styles.accountSheetOpen : ""}`}
        aria-hidden={!open}
      >
        <h3 className={styles.sheetTitle}>Minha Conta</h3>
        <div className={styles.sheetLinks}>
          {accountLinks.map(({ label, href, Icon }) => (
            <Link key={label} href={href} className={styles.sheetLink} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
