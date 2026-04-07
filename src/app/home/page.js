"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PawPrint, Home } from 'lucide-react'
import styles from './home.module.css'
import Carousel from '../../components/Carousel'
import Button from "../../components/Button";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_PETZ_API_URL || "http://localhost:3000")
    .trim()
    .replace(/\/$/, "");

// Função para obter URL da imagem (BLOB ou URL direta)
const getImageUrl = (pet) => {
  if (pet.hasImage) {
    return `${getBaseUrl()}/api/pets/${pet.id}/image`;
  }
  return pet.imagem || pet.image || "/images/semfoto.jpg";
};

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    try {
      document.body.classList.add('no-site-bg');
    } catch (e) {}
    return () => {
      try {
        document.body.classList.remove('no-site-bg');
      } catch (e) {}
    };
  }, []);

  const [perdidos, setPerdidos] = useState([])
  const [adocao, setAdocao] = useState([])
  const [totalEncontrados, setTotalEncontrados] = useState(0)
  const [totalAdotados, setTotalAdotados] = useState(0)
  const [nomeUsuario, setNomeUsuario] = useState("")

  useEffect(() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
      if (usuario) {
        const nome = usuario.nome || usuario.name || usuario.razaoSocial || "";
        if (nome) setNomeUsuario(nome);
      }
    } catch {}
  }, [])

  async function carregarPets() {
    try {
      const res = await fetch(`${getBaseUrl()}/api/pets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao buscar pets");

      const data = await res.json();
      const listaPets = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

      const petsPerdidos = listaPets
        .filter(p => p.status === 'lost' || p.status === 'perdido')
        .map(pet => ({
          id: pet.id,
          name: pet.nome || pet.name,
          breed: pet.raca || pet.breed,
          gender: pet.genero || pet.gender,
          location: pet.local || pet.location || pet.descricao || pet.description || "",
          img: getImageUrl(pet),
          link: "/pets-perdidos"
        }));

      setPerdidos(petsPerdidos);

      const encontrados = listaPets.filter(p => p.status === 'found');
      setTotalEncontrados(encontrados.length);
     

      const petsParaAdocao = listaPets
        .filter(p => p.status === 'available' || p.status === 'adocao')
        .map(pet => ({
          id: pet.id,
          name: pet.nome || pet.name,
          breed: pet.raca || pet.breed,
          gender: pet.genero || pet.gender,
          age: pet.idade || pet.age || "",
          img: getImageUrl(pet),
          link: "/pets-para-adocao"
        }));
      setAdocao(petsParaAdocao);

      const adotados = listaPets.filter(p => p.status === 'adopted');
      setTotalAdotados(adotados.length);
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
      console.log(token);
      setPerdidos([]);
      setAdocao([]);
      setTotalEncontrados(0);
      setTotalAdotados(0);
    }
  }

  useEffect(() => {
    carregarPets()
  }, [])

  return (
    <div className={styles.pageWrap}>
      <section className={styles.hero}>
        <img className={styles.leftImg} src="/images/cachorro-pagina-principal%202.png" alt="" />
        <img className={styles.rightImg} src="/images/cachorro-pagina-principal.png" alt="" />
        <div className={styles.inner}>
          <h1>Bem Vindo{nomeUsuario ? `, ${nomeUsuario}` : ""}!</h1>
          <p>
            Cada clique transforma vidas: aqui você pode reencontrar seu pet, adotar com amor ou doar para quem precisa.
            Juntos, criamos lindas histórias de afeto, esperança e recomeços.
          </p>
        </div>
      </section>

      <section className={styles.blockPet}>
        <div className={styles.buttonGroup}>
          <Button
            variant="primary"
            size="large"
            onClick={() => router.push('/cadastrar-pets-perdidos')}
          >
            Cadastrar Pets Perdidos
          </Button>
          <Button
            variant="primary"
            size="large"
            onClick={() => router.push('/cadastro-pet-adocao')}
          >
            Cadastrar Pets Para adoção
          </Button>
        </div>
      </section>

      <section className={styles.block}>
        <h3 className={styles.title}>Pets para adoção</h3>
        <Carousel items={adocao} />
      </section>

      <section className={styles.block}>
        <h3 className={styles.title}>Perdidos recentemente</h3>
        <Carousel items={perdidos} />
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={`${styles.statCard} ${styles.statCardEncontrados}`}>
            <div className={styles.statIcon}><PawPrint size={36} strokeWidth={1.5} /></div>
            <div className={styles.statNumber}>{totalEncontrados}</div>
            <div className={styles.statLabel}>Pets Encontrados</div>
            <p className={styles.statDescription}>
              Pets que foram reencontrados por seus donos graças à nossa comunidade.
            </p>
          </div>

          <div className={`${styles.statCard} ${styles.statCardAdotados}`}>
            <div className={styles.statIcon}><Home size={36} strokeWidth={1.5} /></div>
            <div className={styles.statNumber}>{totalAdotados}</div>
            <div className={styles.statLabel}>Pets Adotados</div>
            <p className={styles.statDescription}>
              Pets que encontraram um novo lar cheio de amor e carinho.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}