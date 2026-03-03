// ===============================
// CONFIGURAÇÕES
// ===============================
// URL do seu Google Apps Script (Web App) para salvar as inscrições via POST.
// Exemplo: https://script.google.com/macros/s/AKfycb.../exec
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkKl7Z8ALFs-WxqgMkt1lBncC0SB-t2Rpc4Bkyax6sqjiiLh75eCuEYwukiGSTKWFD/exec";

// URL pública (CSV) da planilha para leitura de resultados.
// Exemplo: https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA/export?format=csv&gid=0
const RESULTADOS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSgqsdSxLXy1C7tIqVmC8TJQdnUhZVeesjteXEMjOmwyqVkAc2YEIjIwAkW347yOt0k3JvwdwT7yqF6/pub?output=csv";

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initMenuMobile();
  initActiveNav();
  initBackToTop();
  initInscricaoForm();
  initResultadoPage();
});

// ===============================
// MENU MOBILE
// ===============================
function initMenuMobile() {
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!menuBtn || !nav) return;

  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function initActiveNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll("a[href]"));
  if (!links.length) return;

  const setActiveLink = () => {
    const currentPath = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const currentHash = window.location.hash;

    links.forEach((link) => {
      const href = (link.getAttribute("href") || "").trim();
      let isActive = false;

      if (href.startsWith("#")) {
        isActive = currentPath === "index.html" && currentHash === href;
      } else {
        const [pathPart, hashPart] = href.split("#");
        const targetPath = (pathPart || "index.html").toLowerCase();

        if (targetPath === currentPath) {
          if (hashPart) {
            isActive = currentHash === `#${hashPart}`;
          } else if (targetPath === "index.html") {
            isActive = currentHash === "";
          } else {
            isActive = true;
          }
        }
      }

      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  setActiveLink();
  window.addEventListener("hashchange", setActiveLink);
}

// ===============================
// BOTÃO VOLTAR AO TOPO
// ===============================
function initBackToTop() {
  const backToTopBtn = document.querySelector(".back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ===============================
// INSCRIÇÃO - FORMULÁRIO
// ===============================
function initInscricaoForm() {
  const form = document.querySelector("#inscricao-form");
  if (!form) return;

  const messageEl = document.querySelector("#form-message");
  const submitBtn = document.querySelector("#submit-btn");
  const loader = submitBtn?.querySelector(".loader");
  const btnText = submitBtn?.querySelector(".btn-text");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessage(messageEl);

    const formData = new FormData(form);
    const payload = {
      nome: sanitizeText(formData.get("nome")),
      idade: sanitizeText(formData.get("idade")),
      posicao: sanitizeText(formData.get("posicao")),
      dataNascimento: sanitizeText(formData.get("nascimento")),
      email: sanitizeText(formData.get("email")),
      cidade: sanitizeText(formData.get("cidade")),
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setMessage(messageEl, validationError, "error");
      return;
    }

    if (!isAppsScriptConfigured()) {
      setMessage(
        messageEl,
        "Configure a URL do Google Apps Script no arquivo script.js para habilitar o envio.",
        "error"
      );
      return;
    }

    toggleLoading(submitBtn, loader, btnText, true);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams(payload).toString(),
      });

      setMessage(messageEl, "Inscrição enviada!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar inscrição:", error);
      setMessage(messageEl, "Erro ao enviar. Tente novamente.", "error");
    } finally {
      toggleLoading(submitBtn, loader, btnText, false);
    }
  });
}

// Sanitização básica para reduzir riscos de injeção de scripts e limpar espaços
function sanitizeText(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/[<>]/g, "")
    .replace(/["'`;]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Validação dos campos obrigatórios + formatos básicos
function validatePayload(data) {
  const requiredFields = ["nome", "idade", "posicao", "dataNascimento", "email", "cidade"];

  for (const field of requiredFields) {
    if (!data[field]) {
      return "Preencha todos os campos obrigatórios.";
    }
  }

  const age = Number(data.idade);
  if (Number.isNaN(age) || age < 5 || age > 60) {
    return "Informe uma idade válida.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return "Informe um e-mail válido.";
  }

  // Aceita telefone com DDD e variações comuns: (11) 99999-9999, 11999999999, etc.
  return "";
}

function isAppsScriptConfigured() {
  return (
    APPS_SCRIPT_URL &&
    !APPS_SCRIPT_URL.includes("COLE_AQUI") &&
    APPS_SCRIPT_URL.startsWith("http") &&
    APPS_SCRIPT_URL.includes("/exec") &&
    !APPS_SCRIPT_URL.includes("/library/")
  );
}

function toggleLoading(button, loader, text, isLoading) {
  if (!button || !loader || !text) return;

  button.disabled = isLoading;
  loader.classList.toggle("hidden", !isLoading);
  text.textContent = isLoading ? "Enviando..." : "Enviar Inscrição";
}

function setMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("success", "error");
  element.classList.add(type);
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = "";
  element.classList.remove("success", "error");
}

// ===============================
// RESULTADO - LEITURA DA PLANILHA
// ===============================
async function initResultadoPage() {
  const resultList = document.querySelector("#resultado-lista");
  const emptyMessage = document.querySelector("#resultado-vazio");
  if (!resultList || !emptyMessage) return;

  if (!isResultadosConfigured()) {
    emptyMessage.classList.remove("hidden");
    emptyMessage.textContent =
      "Resultado ainda não divulgado. Configure a URL pública CSV da planilha em script.js.";
    return;
  }

  try {
    const response = await fetch(RESULTADOS_CSV_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha na leitura da planilha: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    // Espera colunas: Nome, Categoria, Status (linha 1 é cabeçalho)
    const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim() !== ""));

    if (!dataRows.length) {
      emptyMessage.classList.remove("hidden");
      emptyMessage.textContent = "Resultado ainda não divulgado.";
      return;
    }

    const cards = dataRows
      .map((row) => {
        const [nome = "-", categoria = "-", status = "-"] = row.map((cell) => sanitizeText(cell));
        const statusLower = status.toLowerCase();
        const isAprovado = statusLower.includes("aprovado");
        const isEspera = statusLower.includes("espera");

        return `
          <article class="result-card ${isAprovado ? "approved" : ""}">
            <h3>${escapeHtml(nome)}</h3>
            <p><strong>Categoria:</strong> ${escapeHtml(categoria)}</p>
            <p class="status ${isAprovado ? "approved-text" : isEspera ? "waiting-text" : ""}">
              <strong>Status:</strong> ${escapeHtml(status)}
            </p>
          </article>
        `;
      })
      .join("");

    resultList.innerHTML = cards;
  } catch (error) {
    console.error("Erro ao carregar resultados:", error);
    emptyMessage.classList.remove("hidden");
    emptyMessage.textContent = "Resultado ainda não divulgado.";
  }
}

function isResultadosConfigured() {
  return (
    RESULTADOS_CSV_URL &&
    !RESULTADOS_CSV_URL.includes("COLE_AQUI") &&
    RESULTADOS_CSV_URL.startsWith("http")
  );
}

// Parser CSV simples que suporta vírgulas dentro de aspas
function parseCSV(csv) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

// Evita injeção de HTML ao renderizar dados da planilha
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}
