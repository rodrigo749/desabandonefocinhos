"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RiHeart3Fill, RiHeart3Line, RiUser3Fill, RiUser3Line } from "react-icons/ri";
import { IoPaw, IoPawOutline } from "react-icons/io5";
import { MdSearch, MdOutlineSearch } from "react-icons/md";
import NavItem from "./NavItem";
import AccountMenu from "./AccountMenu";
import styles from "./bottomNav.module.css";

const MAIN_ITEMS = [
  {
    id: "adocoes",
    label: "Adoções",
    href: "/pets-para-adocao",
    Icon: IoPawOutline,
    ActiveIcon: IoPaw,
  },
  {
    id: "perdidos",
    label: "Pets Perdidos",
    href: "/pets-perdidos",
    Icon: MdOutlineSearch,
    ActiveIcon: MdSearch,
  },
  {
    id: "apoiar",
    label: "Apoiar",
    href: "/apoiar",
    Icon: RiHeart3Line,
    ActiveIcon: RiHeart3Fill,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const accountButtonRef = useRef(null);
  const accountMenuRef = useRef(null);

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
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountOpen) return;

      const clickedOnButton = accountButtonRef.current?.contains(event.target);
      const clickedOnMenu = accountMenuRef.current?.contains(event.target);
      if (!clickedOnButton && !clickedOnMenu) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountOpen]);

  const isItemActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);
  const isAccountRoute =
    pathname === "/perfil-usuario" ||
    pathname === "/meus-pets-perdidos" ||
    pathname === "/seus-pets-para-adocao" ||
    pathname === "/login-usuario" ||
    pathname === "/cadastro-usuario" ||
    pathname === "/admin" ||
    pathname?.startsWith("/admin/pets-perdidos");

  return (
    <>
      <AccountMenu
        open={accountOpen}
        menuRef={accountMenuRef}
        onClose={() => setAccountOpen(false)}
        usuarioLogado={usuarioLogado}
      />

      <nav className={styles.bottomNav} aria-label="Navegação principal">
        {MAIN_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            href={item.href}
            label={item.label}
            Icon={item.Icon}
            ActiveIcon={item.ActiveIcon}
            isActive={isItemActive(item.href)}
          />
        ))}

        <div ref={accountButtonRef}>
          <NavItem
            asButton
            label="Minha Conta"
            Icon={RiUser3Line}
            ActiveIcon={RiUser3Fill}
            isActive={accountOpen || isAccountRoute}
            onClick={() => setAccountOpen((prev) => !prev)}
          />
        </div>
      </nav>
    </>
  );
}
