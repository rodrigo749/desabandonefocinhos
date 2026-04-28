"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, Search, ListChecks, FilePlus } from "lucide-react";
import styles from "./admin.module.css";
import { getApiUrl } from '@/lib/apiUrl';

const API_URL = getApiUrl();

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [countAdocao, setCountAdocao] = useState(0);
  const [countPerdidos, setCountPerdidos] = useState(0);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    if (!u || u.tipo !== "admin") {
      router.push("/admin/login");
      return;
    }
    setAdmin(u);
    carregarContagens();
  }, [router]);

  async function carregarContagens() {
    try {
      const res = await fetch(`${API_URL}/api/pets`, { cache: "no-store" });
      const data = await res.json();
      const lista = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];
      setCountAdocao(lista.filter((p) => p.status === "available" || p.status === "adopted" || p.status === "adocao" || p.status === "adotado").length);
      setCountPerdidos(lista.filter((p) => p.status === "lost" || p.status === "perdido").length);
    } catch {
      // ignore
    }
  }

  if (!admin) return null;

  return (
    <div className={styles.container}>
      <div className={styles.pageInner}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1>Painel do Administrador</h1>
            <p>Bem-vindo de volta, <strong>{admin.nome}</strong></p>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Stat cards */}
        <p className={styles.sectionLabel}>Visão Geral</p>
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statCardAdocao}`}>
            <div className={styles.statIconWrap}>
              <PawPrint size={28} strokeWidth={1.8} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{countAdocao}</span>
              <span className={styles.statLabel}>Pets para Adoção</span>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPerdidos}`}>
            <div className={`${styles.statIconWrap} ${styles.statIconLost}`}>
              <Search size={28} strokeWidth={1.8} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{countPerdidos}</span>
              <span className={styles.statLabel}>Pets Perdidos</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <p className={styles.sectionLabel}>Gerenciamento</p>
        <div className={styles.actionsGrid}>
          <Link href="/admin/pets-adocao" className={`${styles.btnAction} ${styles.btnPrimary}`}>
            <ListChecks size={22} strokeWidth={1.8} />
            <span>Gerenciar Pets Adoção</span>
          </Link>
          <Link href="/admin/pets-perdidos" className={`${styles.btnAction} ${styles.btnPrimary}`}>
            <ListChecks size={22} strokeWidth={1.8} />
            <span>Gerenciar Pets Perdidos</span>
          </Link>
          <Link href="/cadastro-pet-adocao" className={`${styles.btnAction} ${styles.btnSecondary}`}>
            <FilePlus size={22} strokeWidth={1.8} />
            <span>Cadastrar Pet Adoção</span>
          </Link>
          <Link href="/cadastrar-pets-perdidos" className={`${styles.btnAction} ${styles.btnSecondary}`}>
            <FilePlus size={22} strokeWidth={1.8} />
            <span>Cadastrar Pet Perdido</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
