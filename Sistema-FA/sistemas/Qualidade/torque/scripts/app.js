// app.js (versão corrigida para SPA com fetch + telas dinâmicas)

// =====================================================
// 0) MENU LATERAL (blur + responsivo)
// =====================================================
function abrirMenu() {
  const menu = document.getElementById("menu-lateral");
  if (!menu) return;

  const isOculto = menu.classList.toggle("menu-oculto"); // true se ficou oculto
  document.body.classList.toggle("menu-aberto", !isOculto);
}

const mql = window.matchMedia("(min-width: 993px)");

function syncLayout(e) {
  const menu = document.getElementById("menu-lateral");
  const principal = document.getElementById("principal");

  if (e.matches) {
    // >= 993
    document.body.classList.remove("menu-aberto");
    menu?.classList.remove("menu-oculto");
    if (principal) principal.style.filter = "";
  } else {
    // < 993
    document.body.classList.remove("menu-aberto");
    menu?.classList.add("menu-oculto");
  }
}

mql.addEventListener("change", syncLayout);
syncLayout(mql);

// =====================================================
// 1) CARREGAR CONTEÚDO (SPA simples)
// =====================================================
window.carregarConteudo = function (arquivo) {
  const container = document.getElementById("conteudo-dinamico");
  if (!container) {
    console.error('Erro: Elemento com id "conteudo-dinamico" não foi encontrado.');
    return;
  }

  localStorage.setItem("ultimaPaginaAcessada", arquivo);

  fetch(arquivo)
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao carregar: " + response.statusText);
      return response.text();
    })
    .then((html) => {
      container.innerHTML = html;

      atualizarMenuAtivo(arquivo);
      // ✅ sempre que troca de tela, re-inicializa recursos daquela tela
      setupTelaCarregada();
    })
    .catch((error) => {
      console.error("Erro:", error);
      container.innerHTML =
        '<p style="color:red; padding:20px;">Erro ao carregar o conteúdo. Verifique o console (F12).</p>';
    });


    
};

document.addEventListener("DOMContentLoaded", function () {
  const paginaSalva = localStorage.getItem("ultimaPaginaAcessada");
  if (paginaSalva) carregarConteudo(paginaSalva);
  else carregarConteudo("dashboard.html");
});

// =====================================================
// 2) CLICK GLOBAL (fecha menus de filtro dashboard/estoque)
// =====================================================
document.addEventListener("click", function (event) {
  // --- DASHBOARD ---
  const menuDash = document.getElementById("conteudo-btn-filtro");
  const btnDash = document.getElementById("btn-filtro-dashboard");

  if (menuDash && menuDash.classList.contains("ativo")) {
    const clicouNoBtnDash = btnDash ? btnDash.contains(event.target) : false;
    if (!menuDash.contains(event.target) && !clicouNoBtnDash) {
      menuDash.classList.remove("ativo");
    }
  }

  // --- ESTOQUE ---
  const menuEst = document.getElementById("conteudo-btn-filtro-estoque");
  const btnEst = document.getElementById("btn-filtro-estoque");

  if (menuEst && menuEst.classList.contains("ativo")) {
    const clicouNoBtnEst = btnEst ? btnEst.contains(event.target) : false;
    if (!menuEst.contains(event.target) && !clicouNoBtnEst) {
      menuEst.classList.remove("ativo");
    }
  }
});

// Filtros (funções globais chamadas no HTML)
window.alternarFiltroEstoque = function () {
  const menu = document.getElementById("conteudo-btn-filtro-estoque");
  if (!menu) return;
  menu.classList.toggle("ativo");
};

window.alternarFiltroDashboard = function () {
  const menu = document.getElementById("conteudo-btn-filtro");
  if (!menu) return;
  menu.classList.toggle("ativo");
};

// =====================================================
// 3) SETUP POR TELA (roda após carregar HTML no container)
// =====================================================
let cleanupFns = []; // para remover listeners de telas antigas

function setupTelaCarregada() {
  // remove listeners antigos para evitar duplicar eventos
  cleanupFns.forEach((fn) => {
    try {
      fn();
    } catch (_) {}
  });
  cleanupFns = [];

  // Inicializações por tela
  setupAtividades(); // só ativa se detectar elementos
  setupBotoesFiltroAtividades(); // botões btn-data (se existirem)
}

// =====================================================
// 4) ATIVIDADES (Histórico, DragDrop, Menu "...", Modal)
// =====================================================
function setupAtividades() {
  const board = document.querySelector("#colunas");
  const historico = document.getElementById("historico");
  const overlayHistorico = document.getElementById("overlay");
  const btnHistorico = document.getElementById("btn-historico");

  const taskMenu = document.getElementById("task-menu");
  const overlayModal = document.getElementById("overlay-modal");
  const modalEditar = document.getElementById("modal-editar");

  // Se não é a tela de atividades (não tem board e nem taskMenu/historico), não faz nada
  if (!board && !taskMenu && !historico) return;

  // ---------------------------
  // 4.1 Histórico (abre/fecha)
  // ---------------------------
  if (btnHistorico && historico && overlayHistorico) {
    const fecharHistoricoBtn = document.querySelector("#historico #header-historico .fa-x");

    const abrirHistorico = () => {
      historico.classList.add("ativo");
      overlayHistorico.classList.add("ativo");
      document.body.style.overflow = "hidden";
    };

    const fecharHistorico = () => {
      historico.classList.remove("ativo");
      overlayHistorico.classList.remove("ativo");
      document.body.style.overflow = "";
    };

    btnHistorico.addEventListener("click", abrirHistorico);
    fecharHistoricoBtn?.addEventListener("click", fecharHistorico);
    overlayHistorico.addEventListener("click", fecharHistorico);

    cleanupFns.push(() => {
      btnHistorico.removeEventListener("click", abrirHistorico);
      fecharHistoricoBtn?.removeEventListener("click", fecharHistorico);
      overlayHistorico.removeEventListener("click", fecharHistorico);
    });
  }

  // ---------------------------
  // 4.2 Drag & Drop (ordenar entre cards)
  // ---------------------------
  if (board) {
    const BOARD_SELECTOR = "#colunas";
    const COLUMN_SELECTOR = ".card";
    const ITEM_SELECTOR = ".card-content";

    let draggedEl = null;

    function getDragAfterElement(column, mouseY) {
      const items = [...column.querySelectorAll(`${ITEM_SELECTOR}:not(.dragging)`)];
      let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

      for (const item of items) {
        const box = item.getBoundingClientRect();
        const offset = mouseY - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
          closest = { offset, element: item };
        }
      }
      return closest.element;
    }

    function prepareItem(el) {
      if (!el || !el.matches?.(ITEM_SELECTOR)) return;

      el.setAttribute("draggable", "true");
      if (el.dataset.ddReady === "1") return;
      el.dataset.ddReady = "1";

      el.addEventListener("dragstart", (e) => {
        draggedEl = el;
        el.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "drag");
        setTimeout(() => (el.style.opacity = "0.6"), 0);
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
        el.style.opacity = "";
        draggedEl = null;
        document.querySelectorAll(COLUMN_SELECTOR).forEach((c) => c.classList.remove("over"));
      });
    }

    // prepara cards existentes
    board.querySelectorAll(ITEM_SELECTOR).forEach(prepareItem);

    // colunas dropzones
    const cols = board.querySelectorAll(COLUMN_SELECTOR);

    const onDragOver = (col) => (e) => {
      e.preventDefault();
      col.classList.add("over");
      if (!draggedEl) return;

      const afterEl = getDragAfterElement(col, e.clientY);
      if (afterEl == null) col.appendChild(draggedEl);
      else col.insertBefore(draggedEl, afterEl);
    };

    const onDragLeave = (col) => () => col.classList.remove("over");
    const onDrop = (col) => (e) => {
      e.preventDefault();
      col.classList.remove("over");
    };

    cols.forEach((col) => {
      const a = onDragOver(col);
      const b = onDragLeave(col);
      const c = onDrop(col);
      col.addEventListener("dragover", a);
      col.addEventListener("dragleave", b);
      col.addEventListener("drop", c);

      cleanupFns.push(() => {
        col.removeEventListener("dragover", a);
        col.removeEventListener("dragleave", b);
        col.removeEventListener("drop", c);
      });
    });

    // novos cards adicionados depois já ficam arrastáveis
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(ITEM_SELECTOR)) prepareItem(node);
          node.querySelectorAll?.(ITEM_SELECTOR).forEach(prepareItem);
        });
      }
    });
    obs.observe(board, { childList: true, subtree: true });

    cleanupFns.push(() => obs.disconnect());
  }

  // ---------------------------
  // 4.3 Adicionar atividade (+)
  // ---------------------------
  function adicionarCardNaColuna(colunaEl, { titulo, descricao, responsavel, prioridade } = {}) {
    if (!colunaEl || !colunaEl.matches(".card")) return null;

    const dados = {
      titulo: titulo?.trim() || "Nova atividade",
      descricao: descricao?.trim() || "",
      responsavel: responsavel?.trim() || "Não definido",
      prioridade: (prioridade || "baixa").toString().toLowerCase(), // baixa | media | alta
    };

    const card = document.createElement("div");
    card.className = "card-content";

    card.innerHTML = `
      <div class="titulo-e-moreinfo">
        <h3 class="titulo-card-content">${dados.titulo}</h3>
        <a href="#" class="more-info" title="Mais opções"><i class="fa-solid fa-ellipsis-vertical"></i></a>
      </div>
      ${dados.descricao ? `<p class="descricao-card-content">${dados.descricao}</p>` : ""}
      <div class="user-e-prioridade">
        <p class="nome-usuario"><i class="fa-solid fa-user"></i> ${dados.responsavel}</p>
        <p class="prioridade ${dados.prioridade}">
          Prioridade ${
            dados.prioridade === "media"
              ? "Média"
              : dados.prioridade[0].toUpperCase() + dados.prioridade.slice(1)
          }
        </p>
      </div>
    `;

    colunaEl.appendChild(card);
    card.setAttribute("draggable", "true");
    return card;
  }

  // Delegation: funciona mesmo com cards/telas injetadas
  const onClickAddAtividade = (e) => {
    const btn = e.target.closest(".adc-atividade");
    if (!btn) return;
    e.preventDefault();
    const coluna = btn.closest(".card");
    adicionarCardNaColuna(coluna, {
      titulo: "Nova atividade",
      descricao: "Descreva aqui...",
      responsavel: "Usuário X",
      prioridade: "baixa",
    });
  };
  document.addEventListener("click", onClickAddAtividade);
  cleanupFns.push(() => document.removeEventListener("click", onClickAddAtividade));

  // ---------------------------
  // 4.4 MENU "..." + MODAL (só se existir)
  // ---------------------------
  if (!taskMenu) return; // sem task-menu, não inicializa isso

  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");
  const btnSalvarModal = document.getElementById("btn-salvar-modal");

  const inputTitulo = document.getElementById("edit-titulo");
  const inputDescricao = document.getElementById("edit-descricao");
  const inputResponsavel = document.getElementById("edit-responsavel");

  const prioridadeBox = document.getElementById("edit-prioridade");
  const prioridadeBtns = prioridadeBox ? prioridadeBox.querySelectorAll("button") : [];
  let prioridadeSelecionada = "baixa";
  let cardSelecionado = null;

  // prioridade (botões)
  prioridadeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      prioridadeBtns.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      prioridadeSelecionada = btn.value;
    });
  });

  function setPrioridadeNoModal(valor) {
    prioridadeSelecionada = valor || "baixa";
    prioridadeBtns.forEach((b) => b.classList.toggle("ativo", b.value === prioridadeSelecionada));
  }

  function fecharMenu(apagarSelecao = false) {
    taskMenu.classList.remove("ativo");
    taskMenu.style.left = "";
    taskMenu.style.top = "";
    taskMenu.setAttribute("aria-hidden", "true");
    if (apagarSelecao) cardSelecionado = null;
  }

  function abrirMenuNaPosicao(x, y, cardContent) {
    cardSelecionado = cardContent;
    taskMenu.style.left = `${x}px`;
    taskMenu.style.top = `${y}px`;
    taskMenu.classList.add("ativo");
    taskMenu.setAttribute("aria-hidden", "false");
  }

  function abrirModal() {
    if (!cardSelecionado || !overlayModal || !modalEditar) return;

    const titulo = cardSelecionado.querySelector(".titulo-card-content")?.textContent?.trim() || "";
    const descricao = cardSelecionado.querySelector(".descricao-card-content")?.textContent?.trim() || "";

    const prEl = cardSelecionado.querySelector(".prioridade");
    const prioridade = prEl?.classList.contains("alta")
      ? "alta"
      : prEl?.classList.contains("media")
      ? "media"
      : "baixa";

    // preencher
    if (inputTitulo) inputTitulo.value = titulo;
    if (inputDescricao) inputDescricao.value = descricao;

    // responsável (texto limpo)
    const responsavelText =
      cardSelecionado.querySelector(".nome-usuario")?.textContent?.replace(/\s+/g, " ").trim() || "";
    if (inputResponsavel) inputResponsavel.value = responsavelText.replace("user", "").trim();

    setPrioridadeNoModal(prioridade);

    overlayModal.classList.add("ativo");
    modalEditar.classList.add("ativo");
    overlayModal.setAttribute("aria-hidden", "false");
    modalEditar.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => inputTitulo?.focus?.(), 0);
  }

  function fecharModal() {
    if (!overlayModal || !modalEditar) return;
    overlayModal.classList.remove("ativo");
    modalEditar.classList.remove("ativo");
    overlayModal.setAttribute("aria-hidden", "true");
    modalEditar.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function aplicarEdicaoNoCard({ titulo, descricao, responsavel, prioridade }) {
    if (!cardSelecionado) return;

    const tEl = cardSelecionado.querySelector(".titulo-card-content");
    if (tEl) tEl.textContent = titulo;

    // descrição cria/remove
    let dEl = cardSelecionado.querySelector(".descricao-card-content");
    if (descricao && descricao.trim()) {
      if (!dEl) {
        dEl = document.createElement("p");
        dEl.className = "descricao-card-content";
        const titleRow = cardSelecionado.querySelector(".titulo-e-moreinfo");
        titleRow?.after(dEl);
      }
      dEl.textContent = descricao.trim();
    } else {
      dEl?.remove();
    }

    // responsável
    const rEl = cardSelecionado.querySelector(".nome-usuario");
    if (rEl) rEl.innerHTML = `<i class="fa-solid fa-user"></i> ${responsavel || "Não definido"}`;

    // prioridade classes + texto
    const pEl = cardSelecionado.querySelector(".prioridade");
    if (pEl) {
      pEl.classList.remove("baixa", "media", "alta");
      pEl.classList.add(prioridade);

      const texto = prioridade === "media" ? "Média" : prioridade[0].toUpperCase() + prioridade.slice(1);
      pEl.textContent = `Prioridade ${texto}`;
    }
  }

  // abrir menu no "..."
  const onClickMore = (e) => {
    const btnMore = e.target.closest(".more-info");
    if (!btnMore) return;

    e.preventDefault();
    e.stopPropagation();

    const card = btnMore.closest(".card-content");
    if (!card) return;

    // toggle
    if (taskMenu.classList.contains("ativo") && cardSelecionado === card) {
      fecharMenu(false);
      return;
    }

    abrirMenuNaPosicao(e.clientX + 8, e.clientY + 8, card);
  };

  // clicar fora fecha
  const onClickOutsideMenu = (e) => {
    if (!taskMenu.classList.contains("ativo")) return;
    const clicouNoMenu = e.target.closest("#task-menu");
    const clicouNoMore = e.target.closest(".more-info");
    if (!clicouNoMenu && !clicouNoMore) fecharMenu(false);
  };

  // ações do menu
  const onClickTaskMenu = (e) => {
    const btn = e.target.closest(".task-menu-btn");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "edit") {
      fecharMenu(false);
      abrirModal();
      return;
    }

    if (action === "remove") {
      if (!cardSelecionado) return;
      const alvo = cardSelecionado;
      fecharMenu(true);
      alvo.remove();
      return;
    }

    if (action === "details") {
      // placeholder futuro
      fecharMenu(false);
      alert("Mais detalhes: (implementar)");
    }
  };

  document.addEventListener("click", onClickMore);
  document.addEventListener("click", onClickOutsideMenu);
  taskMenu.addEventListener("click", onClickTaskMenu);

  cleanupFns.push(() => document.removeEventListener("click", onClickMore));
  cleanupFns.push(() => document.removeEventListener("click", onClickOutsideMenu));
  cleanupFns.push(() => taskMenu.removeEventListener("click", onClickTaskMenu));

  // modal fechar
  const onFecharModal = () => fecharModal();

  btnFecharModal?.addEventListener("click", onFecharModal);
  btnCancelarModal?.addEventListener("click", onFecharModal);
  overlayModal?.addEventListener("click", onFecharModal);

  cleanupFns.push(() => btnFecharModal?.removeEventListener("click", onFecharModal));
  cleanupFns.push(() => btnCancelarModal?.removeEventListener("click", onFecharModal));
  cleanupFns.push(() => overlayModal?.removeEventListener("click", onFecharModal));

  // modal salvar
  const onSalvar = () => {
    if (!cardSelecionado) return;

    const titulo = inputTitulo?.value?.trim?.() || "";
    if (!titulo) {
      inputTitulo?.focus?.();
      return;
    }

    aplicarEdicaoNoCard({
      titulo,
      descricao: inputDescricao?.value || "",
      responsavel: inputResponsavel?.value?.trim?.() || "",
      prioridade: prioridadeSelecionada,
    });

    fecharModal();
  };

  btnSalvarModal?.addEventListener("click", onSalvar);
  cleanupFns.push(() => btnSalvarModal?.removeEventListener("click", onSalvar));

  // ESC fecha menu/modal/histórico
  const onEsc = (e) => {
    if (e.key !== "Escape") return;

    if (historico?.classList.contains("ativo")) {
      historico.classList.remove("ativo");
      overlayHistorico?.classList.remove("ativo");
      document.body.style.overflow = "";
    }

    if (taskMenu.classList.contains("ativo")) fecharMenu(false);
    if (modalEditar?.classList.contains("ativo")) fecharModal();
  };

  document.addEventListener("keydown", onEsc);
  cleanupFns.push(() => document.removeEventListener("keydown", onEsc));
}

// =====================================================
// 5) Botões de filtro (ativo) - usar delegation
// =====================================================
function setupBotoesFiltroAtividades() {
  const onClickBtnData = (e) => {
    const btn = e.target.closest(".btn-data");
    if (!btn) return;

    // remove ativo dos outros dentro do mesmo grupo (ul)
    const ul = btn.closest("ul");
    if (!ul) return;

    ul.querySelectorAll(".btn-data").forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
  };

  document.addEventListener("click", onClickBtnData);
  cleanupFns.push(() => document.removeEventListener("click", onClickBtnData));
}


function atualizarMenuAtivo(paginaAtual){
  const linksMenu = document.querySelectorAll("#menu-lateral a[data-page]");

  linksMenu.forEach((link) =>{
    const page = link.getAttribute("data-page")
    link.classList.toggle("ativo", page === paginaAtual);
  })
}