"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { NAV_LINKS } from "@/constants/navigation";
import { getAccountLinks } from "@/components/BottomNav/AccountMenu";
import styles from "./header.module.css";

export default function Header() {
  const pathname = usePathname();
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountWrapRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const syncAuth = () => {
      const user = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
      setUsuarioLogado(user);
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isAdmin = usuarioLogado?.tipo === "admin";

  const accountLinks = isAdmin
    ? [
        { label: "Painel de Admin", href: "/admin" },
        { label: "Gerenciar Pets Perdidos", href: "/admin/pets-perdidos" },
        { label: "Gerenciar Pets para Adoção", href: "/admin/pets-adocao" },
        { label: "Sair", href: "/logout" },
      ]
    : [
        { label: "Meu perfil", href: "/perfil-usuario" },
        { label: "Meus pets Perdidos", href: "/meus-pets-perdidos" },
        { label: "Meus pets Adoção", href: "/seus-pets-para-adocao" },
        { label: "Sair", href: "/logout" },
      ];

  const avatarSrc = usuarioLogado?.imagem
    ? usuarioLogado.imagem.startsWith("blob:") || usuarioLogado.imagem.startsWith("http")
      ? usuarioLogado.imagem
      : `${API_URL}${usuarioLogado.imagem}`
    : "/images/icone-perfil.jpg";

  const desktopLinks = NAV_LINKS.filter((link) => {
    if (usuarioLogado && link.id === "login") return false;
    return ["adocao", "perdidos", "apoiar", "login"].includes(link.id);
  });

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/logo.svg"
              alt="Patas Perdidas"
              width={180}
              height={60}
              priority
              className={styles.logoImage}
            />
          </Link>

          <div className={styles.desktopMenu}>
            <div className={styles.desktopLinks}>
              {desktopLinks.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link key={item.id} href={item.href} className={`${styles.desktopLink} ${active ? styles.desktopLinkActive : ""}`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {usuarioLogado && (
              <div className={styles.profileWrap} ref={accountWrapRef}>
                <button
                  type="button"
                  className={styles.avatarButton}
                  onClick={() => setAccountOpen((prev) => !prev)}
                  aria-label="Abrir opções da conta"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  <img
                    src={avatarSrc}
                    alt="Foto do usuário"
                    className={styles.avatarImage}
                    onError={(event) => {
                      event.currentTarget.src = "/images/icone-perfil.jpg";
                    }}
                  />
                </button>

                {accountOpen && (
                  <div className={styles.accountDropdown} role="menu" aria-label="Opções da conta">
                    {accountLinks.map((option) => {
                      const isActive = pathname === option.href || pathname?.startsWith(`${option.href}/`);
                      return (
                        <Link
                          key={option.href}
                          href={option.href}
                          className={`${styles.accountItem} ${isActive ? styles.accountItemActive : ""}`}
                          onClick={() => setAccountOpen(false)}
                        >
                          {option.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>
      <BottomNav />
    </>
  );
}