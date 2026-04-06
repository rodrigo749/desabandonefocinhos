export async function uploadImage(file) {
  if (!file) return null;
  const form = new FormData();
  form.append('imagem', file, file.name);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Erro no upload' }));
    throw new Error(err.error || 'Erro no upload');
  }
  const data = await res.json();
  return data.url; // /uploads/filename
}

export async function savePet(pet) {
  const res = await fetch('/api/pets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pet),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: 'Erro ao salvar' }));
    throw new Error(err.error || 'Erro ao salvar');
  }
  return await res.json();
}
