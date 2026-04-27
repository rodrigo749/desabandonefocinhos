"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { NAV_LINKS } from "@/constants/navigation";
import Avatar from '../Avatar'
import styles from "./header.module.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // 🔐 sincroniza estado de autenticação
  useEffect(() => {
    const syncAuth = () => {
      const u = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
      setUsuarioLogado(u);
    };

    syncAuth();

    // outras abas
    window.addEventListener("storage", syncAuth);
    // mesma aba (login/logout)
    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  const isAdmin = usuarioLogado?.tipo === "admin";

  // sublinks do dropdown de perfil do usuário logado
  const userProfileSubLinks = isAdmin
    ? [
        { label: "Painel Admin", href: "/admin" },
        { label: "Pets para Adoção", href: "/admin/pets-adocao" },
        { label: "Pets Perdidos", href: "/admin/pets-perdidos" },
        { label: "Sair", href: "/logout" },
      ]
    : [
        { label: "Editar perfil", href: "/editar-usuario" },
        { label: "Meus pets Perdidos", href: "/meus-pets-perdidos" },
        { label: "Sair", href: "/logout" },
      ];

  // 🔍 filtra links conforme login
  const navLinksFiltrados = NAV_LINKS.filter((link) => {
    if (link.id === "login" && usuarioLogado) return false;
    return true;
  });

  return (
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

        {/* ================= DESKTOP MENU ================= */}
        <div className={styles.desktop}>
          {navLinksFiltrados.map(({ id, label, href, subLinks }) => (
            <div
              key={id}
              className={styles.dropdown}
              onMouseEnter={() => subLinks && setDropdownOpen(id)}
              onMouseLeave={() => setDropdownOpen(null)}
            >
              {subLinks ? (
                <button
                  className={styles.link}
                  aria-expanded={dropdownOpen === id}
                  aria-haspopup="true"
                >
                  {label}
                  {dropdownOpen === id ? (
                    <FaChevronUp size={12} />
                  ) : (
                    <FaChevronDown size={12} />
                  )}
                </button>
              ) : (
                <Link href={href} className={styles.link}>
                  {label}
                </Link>
              )}

              {subLinks && dropdownOpen === id && (
                <div className={styles.dropdownMenu}>
                  {subLinks
                    .filter((s) => !(s.auth && !usuarioLogado))
                    .map((subLink, index) => (
                      <Link
                        key={index}
                        href={subLink.href}
                        className={styles.dropdownItem}
                      >
                        {subLink.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ================= AVATAR DESKTOP ================= */}
        {usuarioLogado && (
          <div
            className={styles.profileWrap}
            onMouseEnter={() => setDropdownOpen('profileAvatar')}
            onMouseLeave={() => setDropdownOpen(null)}
          >
            <button
              className={styles.avatarLink}
              aria-expanded={dropdownOpen === 'profileAvatar'}
              aria-haspopup="true"
            >
              <span className={styles.avatarIcon}>
                <img
                  src={usuarioLogado.imagem || "/images/icone-perfil.jpg"}
                  alt="Perfil"
                  className={styles.avatarImage}
                />
              </span>
            </button>

            {dropdownOpen === 'profileAvatar' && (
              <div className={styles.dropdownMenu} style={{ left: 'auto', right: 0 }}>
                {userProfileSubLinks.map((s, i) => (
                    <Link key={i} href={s.href} className={styles.dropdownItem}>
                      {s.label}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ================= BOTÃO MOBILE ================= */}
        <button
          className={styles.toggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* ================= MOBILE MENU ================= */}
        {menuOpen && (
          <div className={styles.mobile}>
            <div
              className={styles.overlay}
              onClick={() => setMenuOpen(false)}
            />

            <div className={styles.sheet}>
              <div className={styles.sheetHeader}>
                <Image
                  src="/images/logo.svg"
                  alt="Patas Perdidas"
                  width={200}
                  height={100}
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className={styles.sheetLinks}>
                {navLinksFiltrados.map(({ id, label, href, subLinks }) => (
                  <div key={id}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={styles.mobileLink}
                    >
                      {label}
                      {subLinks && <FaChevronDown size={12} />}
                    </Link>

                    {subLinks && (
                      <div className={styles.mobileSubLinks}>
                        {subLinks
                          .filter((s) => !(s.auth && !usuarioLogado))
                          .map((subLink, index) => (
                            <Link
                              key={index}
                              href={subLink.href}
                              onClick={() => setMenuOpen(false)}
                              className={styles.mobileSubLink}
                            >
                              {subLink.label}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ))}

                  {/* Perfil do usuário logado no menu mobile */}
                  {usuarioLogado && (
                    <div style={{ marginTop: 12 }}>
                      <div className={styles.mobileLink} aria-hidden>
                        Perfil
                      </div>
                      <div className={styles.mobileSubLinks}>
                        {userProfileSubLinks.map((s, i) => (
                          <Link
                            key={i}
                            href={s.href}
                            onClick={() => setMenuOpen(false)}
                            className={styles.mobileSubLink}
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </nav>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}