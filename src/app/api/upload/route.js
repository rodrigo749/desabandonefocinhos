import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("imagem") || data.get("file");

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(process.cwd(), "public/uploads", file.name);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: "Upload feito com sucesso!",
      url: `/uploads/${file.name}`,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}
