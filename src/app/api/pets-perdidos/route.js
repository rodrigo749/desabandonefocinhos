import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/apiUrl";

const API_URL = getApiUrl();

// GET - lista pets perdidos (proxy para o banco de dados)
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/pets`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar pets do banco de dados");

    const data = await res.json();
    const lista = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

    // filtrar apenas pets perdidos e encontrados
    const petsPerdidos = lista.filter(
      (p) => p.status === "lost" || p.status === "perdido" || p.status === "encontrado" || p.status === "achado"
    );

    return NextResponse.json(petsPerdidos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pets perdidos:", error);
    return NextResponse.json({ error: "Erro ao carregar dados" }, { status: 500 });
  }
}

// POST - cadastra novo pet perdido (proxy para o banco de dados)
export async function POST(req) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/api/pets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro ao cadastrar pet perdido:", error);
    return NextResponse.json({ error: "Erro ao cadastrar pet perdido" }, { status: 500 });
  }
}
