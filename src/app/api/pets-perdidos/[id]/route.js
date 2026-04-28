import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/apiUrl";

const API_URL = getApiUrl();

// GET - retorna um pet perdido por ID (proxy para o banco de dados)
export async function GET(_req, { params }) {
  try {
    const { id } = params;
    const res = await fetch(`${API_URL}/api/pets/${id}`, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Pet não encontrado" }, { status: 404 });
    }

    const pet = await res.json();
    return NextResponse.json(pet, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar pet perdido:", error);
    return NextResponse.json({ error: "Erro ao carregar dados" }, { status: 500 });
  }
}

// PUT - atualiza pet perdido (proxy para o banco de dados)
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const token = req.headers.get("authorization") || "";
    const usuarioId = req.headers.get("x-usuario-id") || "";

    const res = await fetch(`${API_URL}/api/pets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
        ...(usuarioId ? { "x-usuario-id": usuarioId } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro ao atualizar pet perdido:", error);
    return NextResponse.json({ error: "Erro ao atualizar pet" }, { status: 500 });
  }
}

// DELETE - exclui pet perdido (proxy para o banco de dados)
export async function DELETE(_req, { params }) {
  try {
    const { id } = params;
    const token = _req.headers.get("authorization") || "";
    const usuarioId = _req.headers.get("x-usuario-id") || "";

    const res = await fetch(`${API_URL}/api/pets/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: token } : {}),
        ...(usuarioId ? { "x-usuario-id": usuarioId } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro ao excluir pet perdido:", error);
    return NextResponse.json({ error: "Erro ao excluir pet" }, { status: 500 });
  }
}
