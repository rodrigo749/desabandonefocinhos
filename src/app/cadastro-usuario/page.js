"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPaw, FaEye, FaEyeSlash } from "react-icons/fa";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import styles from "./cadastro.module.css";
import useSafeToast from "@/components/Toast/useSafeToast";

export default function CadastroPage() {
  const { showToast } = useSafeToast();
  const router = useRouter();

  // estados
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
    imagemPreview: "" // preview local (blob URL)
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // util
  const getBaseUrl = () =>
    (process.env.NEXT_PUBLIC_PETZ_API_URL || `http://localhost:${process.env.PORT || 3000}`).trim().replace(/\/$/, "");

  // form handlers
  const handleChange = (field, value) => {
    if (field === "cpf") {
      value = value.replace(/\D/g, "").slice(0, 11)
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }
    if (field === "telefone") {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 2) value = `(${digits}`;
      else if (digits.length <= 6) value = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      else if (digits.length <= 10) value = `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
      else value = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      showToast(`Imagem maior que ${maxMB}MB. Escolha outra.`, "warning");
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      showToast("Formato inválido. Escolha uma imagem.", "warning");
      return;
    }

    // revoga preview anterior se blob
    if (formData.imagemPreview && formData.imagemPreview.startsWith("blob:")) {
      try { URL.revokeObjectURL(formData.imagemPreview); } catch {}
    }

    setImageFile(file);
    setFormData(prev => ({ ...prev, imagemPreview: URL.createObjectURL(file) }));
  };

  // cleanup preview blob
  useEffect(() => {
    return () => {
      if (formData.imagemPreview && formData.imagemPreview.startsWith("blob:")) {
        try { URL.revokeObjectURL(formData.imagemPreview); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // validações
    const cpfLimpo = (formData.cpf || "").replace(/\D/g, "");
    if (!cpfValidator.isValid(cpfLimpo)) {
      setFieldErrors(prev => ({ ...prev, cpf: "CPF inválido." }));
      setLoading(false);
      return;
    }
    if ((formData.password || "").length < 6) {
      setFieldErrors(prev => ({ ...prev, password: "Mínimo 6 caracteres." }));
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem." }));
      setLoading(false);
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      
      // Envia FormData com a imagem como blob (mesmo padrão dos pets)
      const fd = new FormData();
      fd.append("nome", formData.nome);
      fd.append("cpf", cpfLimpo);
      fd.append("email", formData.email);
      fd.append("telefone", formData.telefone);
      fd.append("password", formData.password);
      fd.append("tipo", "usuario");
      
      if (imageFile) {
        fd.append("imagem", imageFile);
      }

      const res = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        body: fd // FormData envia como multipart/form-data
      });

      const respData = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = respData?.message || respData?.raw || `Erro ao cadastrar (status ${res.status})`;
        // mapear erros para campos quando possível
        if (msg.toLowerCase().includes("email")) setFieldErrors(prev => ({ ...prev, email: "Este email já está em uso." }));
        else if (msg.toLowerCase().includes("cpf")) setFieldErrors(prev => ({ ...prev, cpf: "Este CPF já está cadastrado." }));
        else showToast(msg, "error");
        setLoading(false);
        return;
      }

      // sucesso: salvar token/usuário e redirecionar para perfil
      const saved = respData || {};
      console.log('[CadastroUsuario] resposta backend:', saved);

      // tenta extrair usuário nas chaves comuns
      const userObj = saved.user || saved.usuario || saved.data || saved;
      
      // Se o usuário tem imagem (hasImage), definir a URL do endpoint de imagem
      if (userObj.hasImage && userObj.id) {
        userObj.imagem = `${baseUrl}/api/users/${userObj.id}/image`;
      }

      // salva token em chaves usadas no projeto
      if (saved.token) {
        localStorage.setItem('token', saved.token);
        localStorage.setItem('petz_token', saved.token);
      }

      // salva usuário com chave padrão que o perfil provavelmente lê
      localStorage.setItem('usuarioLogado', JSON.stringify(userObj));

      // Dispara evento para o Header atualizar imediatamente
      window.dispatchEvent(new Event("auth-changed"));

      console.log('[CadastroUsuario] salvo usuarioLogado:', userObj, 'token:', saved.token);
      showToast('Cadastro realizado com sucesso!', 'success');
      router.push('/home');
    } catch (err) {
      console.error("Erro geral:", err);
      showToast("Erro de conexão com o servidor. O backend está ligado?", "error");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Criar nova conta</h1>

        <div className={styles.inputWrapper}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>Nome:
            <input className={styles.input} type="text" required value={formData.nome} onChange={(e) => handleChange("nome", e.target.value)} placeholder="Nome completo" />
          </label>
        </div>

        <div className={styles.inputWrapper} style={fieldErrors.cpf ? {borderColor: 'red'} : {}}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>CPF:
            <input className={styles.input} type="text" inputMode="numeric" required value={formData.cpf} onChange={(e) => handleChange("cpf", e.target.value)} placeholder="000.000.000-00" />
          </label>
        </div>
        {fieldErrors.cpf && <span className={styles.errorText}>{fieldErrors.cpf}</span>}

        <div className={styles.inputWrapper} style={fieldErrors.email ? {borderColor: 'red'} : {}}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>Email:
            <input className={styles.input} type="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="seu@email.com" />
          </label>
        </div>
        {fieldErrors.email && <span className={styles.errorText}>{fieldErrors.email}</span>}

        <div className={styles.inputWrapper}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>Telefone:
            <input className={styles.input} type="tel" required value={formData.telefone} onChange={(e) => handleChange("telefone", e.target.value)} placeholder="(XX) 00000-0000" />
          </label>
        </div>

        <div className={styles.inputWrapper} style={fieldErrors.password ? {borderColor: 'red'} : {}}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>Senha:
            <input className={styles.input} type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Mínimo 6 dígitos" />
          </label>
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {fieldErrors.password && <span className={styles.errorText}>{fieldErrors.password}</span>}

        <div className={styles.inputWrapper} style={fieldErrors.confirmPassword ? {borderColor: 'red'} : {}}>
          <span className={styles.icon}><FaPaw /></span>
          <label className={styles.fieldLabel}>Confirmar:
            <input className={styles.input} type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} placeholder="Repita a senha" />
          </label>
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {fieldErrors.confirmPassword && <span className={styles.errorText}>{fieldErrors.confirmPassword}</span>}

        <div className={styles.uploadWrapper}>
          <label className={styles.uploadBox}>
            {formData.imagemPreview ? (
              <img src={formData.imagemPreview} alt="Preview" className={styles.uploadPreview} />
            ) : (
              <>
                <span className={styles.uploadIcon}>＋</span>
                <span className={styles.uploadText}>Foto de perfil</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} hidden disabled={loading} />
          </label>
        </div>

        <button 
          className={styles.button} 
          type="submit" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <div className={styles.bottomLink}>
          Já tem conta? <a href="/login-usuario">Faça login aqui</a>.
        </div>
      </form>
    </div>
  );
}