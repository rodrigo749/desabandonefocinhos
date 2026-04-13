'use client'

import { useRef, useState, useEffect } from 'react'
import styles from './homePage.module.css'

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
  const carouselRef1 = useRef(null)
  const carouselRef2 = useRef(null)
  const [centerIndex1, setCenterIndex1] = useState(0)
  const [centerIndex2, setCenterIndex2] = useState(0)

  const [perdidos, setPerdidos] = useState([])
  const [adotados, setAdotados] = useState([])
  const [loading, setLoading] = useState(true)

  // Carregar pets do banco de dados
  useEffect(() => {
    async function carregarPets() {
      try {
        const res = await fetch(`${getBaseUrl()}/api/pets`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Erro ao buscar pets");

        const data = await res.json();
        const lista = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

        const petsPerdidos = lista
          .filter(p => p.status === 'lost' || p.status === 'perdido')
          .map(pet => ({
            id: pet.id,
            name: pet.nome || pet.name || "Sem nome",
            breed: pet.raca || pet.breed || "SRD",
            gender: pet.genero || pet.gender || "-",
            location: pet.local || pet.location || "-",
            img: getImageUrl(pet),
          }));

        const petsAdocao = lista
          .filter(p => p.status === 'available' || p.status === 'adocao')
          .map(pet => ({
            id: pet.id,
            name: pet.nome || pet.name || "Sem nome",
            breed: pet.raca || pet.breed || "SRD",
            gender: pet.genero || pet.gender || "-",
            age: pet.idade || pet.age || "",
            location: pet.local || pet.location || "-",
            img: getImageUrl(pet),
          }));

        setPerdidos(petsPerdidos);
        setAdotados(petsAdocao);
      } catch (err) {
        console.error("Erro ao carregar pets:", err);
        setPerdidos([]);
        setAdotados([]);
      } finally {
        setLoading(false);
      }
    }

    carregarPets();
  }, [])

  /**
   * Centraliza o primeiro card ao montar o componente
   */
  useEffect(() => {
    const centerCard = (ref, index) => {
      if (ref.current) {
        const cards = ref.current.querySelectorAll('article')
        if (cards[index]) {
          cards[index].scrollIntoView({ block: 'nearest', inline: 'center' })
        }
      }
    }
    centerCard(carouselRef1, centerIndex1)
    centerCard(carouselRef2, centerIndex2)
  }, [centerIndex1, centerIndex2])

  const scroll = (dir, carouselRef, currentIndex, setIndex, maxLength) => {
    if (maxLength === 0) return
    let newIndex
    if (dir === 'next') {
      newIndex = (currentIndex + 1) % maxLength
    } else {
      newIndex = (currentIndex - 1 + maxLength) % maxLength
    }

    setIndex(newIndex)
    setTimeout(() => {
      const el = carouselRef.current
      if (el) {
        const cards = el.querySelectorAll('article')
        if (cards[newIndex]) {
          cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }
    }, 0)
  }

  if (loading) {
    return (
      <div className={styles.pageWrap}>
        <section className={styles.hero}>
          <img className={styles.leftImg} src="/images/cachorro-pagina-principal%202.png" alt="" />
          <img className={styles.rightImg} src="/images/cachorro-pagina-principal.png" alt="" />
          <div className={styles.inner}>
            <h1>Bem Vindo!</h1>
            <p>Carregando pets...</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={styles.pageWrap}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <img className={styles.leftImg} src="/images/cachorro-pagina-principal%202.png" alt="" />
        <img className={styles.rightImg} src="/images/cachorro-pagina-principal.png" alt="" />
        <div className={styles.inner}>
          <h1>Bem Vindo!</h1>
          <p>
            Cada clique transforma vidas: aqui você pode reencontrar seu pet, adotar com amor ou doar para quem precisa.
            Juntos, criamos lindas histórias de afeto, esperança e recomeços.
          </p>
        </div>
      </section>

      {/* Carrossel de Pets Perdidos */}
      <section className={styles.block}>
        <h3 className={styles.title}>Perdidos recentemente</h3>
        {perdidos.length > 0 ? (
          <div className={styles.carouselWrap}>
            <button
              className={styles.arrow}
              onClick={() => scroll('prev', carouselRef1, centerIndex1, setCenterIndex1, perdidos.length)}
              aria-label="anterior"
            >
              &#8249;
            </button>

            <div ref={carouselRef1} className={styles.carousel}>
              <div className={styles.cards}>
                {perdidos.map((pet, index) => (
                  <article key={pet.id} className={`${styles.card} ${index === centerIndex1 ? styles.highlight : ''}`}>
                    <img src={pet.img} alt={pet.name} />
                    <div className={styles.info}>
                      <div className={styles.name}>{pet.name}</div>
                      <div className={styles.meta}>
                        Raça: {pet.breed}<br/>
                        Gênero: {pet.gender}<br/>
                        Local: {pet.location}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <button
              className={styles.arrow}
              onClick={() => scroll('next', carouselRef1, centerIndex1, setCenterIndex1, perdidos.length)}
              aria-label="próximo"
            >
              &#8250;
            </button>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>Nenhum pet perdido no momento.</p>
        )}
      </section>

      {/* Carrossel de Pets para Adoção */}
      <section className={styles.block}>
        <h3 className={styles.title}>Disponíveis para adoção</h3>
        {adotados.length > 0 ? (
          <div className={styles.carouselWrap}>
            <button
              className={styles.arrow}
              onClick={() => scroll('prev', carouselRef2, centerIndex2, setCenterIndex2, adotados.length)}
              aria-label="anterior"
            >
              &#8249;
            </button>

            <div ref={carouselRef2} className={styles.carousel}>
              <div className={styles.cards}>
                {adotados.map((pet, index) => (
                  <article key={pet.id} className={`${styles.card} ${index === centerIndex2 ? styles.highlight : ''}`}>
                    <img src={pet.img} alt={pet.name} />
                    <div className={styles.info}>
                      <div className={styles.name}>{pet.name}</div>
                      <div className={styles.meta}>
                        Raça: {pet.breed}<br/>
                        Gênero: {pet.gender}<br/>
                        {pet.age && <>Idade: {pet.age}<br/></>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <button
              className={styles.arrow}
              onClick={() => scroll('next', carouselRef2, centerIndex2, setCenterIndex2, adotados.length)}
              aria-label="próximo"
            >
              &#8250;
            </button>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>Nenhum pet disponível para adoção no momento.</p>
        )}
      </section>
    </div>
  )
}
