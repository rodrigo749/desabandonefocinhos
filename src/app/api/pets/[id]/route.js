import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/apiUrl";

const API_URL = getApiUrl();

// GET - busca pet por ID (proxy para o banco de dados)
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const res = await fetch(`${API_URL}/api/pets/${id}`, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }

    const pet = await res.json();
    return NextResponse.json(pet, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pet:", error);
    return NextResponse.json({ error: "Erro ao carregar dados" }, { status: 500 });
  }
}

// PUT - atualiza pet (proxy para o banco de dados)
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const token = req.headers.get("authorization") || "";

    const res = await fetch(`${API_URL}/api/pets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro ao atualizar pet:", error);
    return NextResponse.json({ error: "Erro ao atualizar pet" }, { status: 500 });
  }
}

// DELETE - exclui pet (proxy para o banco de dados)
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const token = req.headers.get("authorization") || "";

    const res = await fetch(`${API_URL}/api/pets/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro ao excluir pet:", error);
    return NextResponse.json({ error: "Erro ao excluir pet" }, { status: 500 });
  }
}
