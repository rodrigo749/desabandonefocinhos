import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/apiUrl";

const API_URL = getApiUrl({ client: false });

// GET - lista pets para adoção (proxy para o banco de dados)
export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/pets`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar pets do banco de dados");

    const data = await res.json();
    const lista = Array.isArray(data.pets) ? data.pets : Array.isArray(data) ? data : [];

    // filtrar apenas pets para adoção (available ou adopted)
    const petsAdocao = lista.filter(
      (p) => p.status === "available" || p.status === "adopted" || p.status === "adocao" || p.status === "adotado"
    );

    return NextResponse.json(petsAdocao, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pets para adoção:", error);
    return NextResponse.json({ error: "Erro ao carregar dados" }, { status: 500 });
  }
}

// POST - redireciona para a API externa
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
    console.error("Erro ao cadastrar pet:", error);
    return NextResponse.json({ error: "Erro ao cadastrar pet" }, { status: 500 });
  }
}
