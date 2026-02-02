// app.js


function abrirMenu() {
  const menu = document.getElementById('menu-lateral');
  const isOculto = menu.classList.toggle('menu-oculto'); // true se ficou oculto

  // blur só quando o menu estiver aberto (não oculto)
  document.body.classList.toggle('menu-aberto', !isOculto);
}

const mql = window.matchMedia('(min-width: 993px)');

function syncLayout(e) {
    if (e.matches) { // >=993
        document.body.classList.remove('menu-aberto');

        // opcional: garanta que o menu não fique com classe de "oculto" no desktop
        document.getElementById('menu-lateral')?.classList.remove('menu-oculto');

        // se você já aplicou filter inline no passado, limpa também:
        const principal = document.getElementById('principal');
            if (principal) principal.style.filter = '';
    }
    else {
        document.body.classList.remove('menu-aberto');
        document.getElementById('menu-lateral')?.classList.add('menu-oculto');
    }
}

mql.addEventListener('change', syncLayout);
syncLayout(mql); // roda uma vez ao carregar


// Usamos window.carregarConteudo para garantir que o HTML enxergue a função
window.carregarConteudo = function(arquivo) {
    
    // 1. Pega a área principal pelo ID que criamos
    var container = document.getElementById('conteudo-dinamico');

    // Verifica se o container existe antes de continuar
    if (!container) {
        console.error('Erro: Elemento com id "conteudo-dinamico" não foi encontrado no HTML.');
        return;
    }

    // 2. Carrega o arquivo solicitado
    fetch(arquivo)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo: ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            // 3. Coloca o HTML novo dentro da tag <main>
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            container.innerHTML = '<p style="color:red; padding:20px;">Erro ao carregar o conteúdo. Verifique o console (F12).</p>';
        });
}

// 1. Função principal de carregar conteúdo
window.carregarConteudo = function(arquivo) {
    
    var container = document.getElementById('conteudo-dinamico');

    if (!container) {
        console.error('Erro: ID conteudo-dinamico não encontrado.');
        return;
    }

    // --- NOVO: Salva a página atual na memória do navegador ---
    localStorage.setItem('ultimaPaginaAcessada', arquivo);
    // ---------------------------------------------------------

    fetch(arquivo)
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            container.innerHTML = '<p>Erro ao carregar.</p>';
        });
}

// 2. --- NOVO: Executa assim que a página abre (F5) ---
document.addEventListener('DOMContentLoaded', function() {
    
    // Tenta pegar o que estava salvo
    const paginaSalva = localStorage.getItem('ultimaPaginaAcessada');

    if (paginaSalva) {
        // Se tinha algo salvo, carrega ele
        carregarConteudo(paginaSalva);
    } else {
        // Se é a primeira vez, carrega o Dashboard padrão
        carregarConteudo('dashboard.html');
    }
});


//ABRIR MENU DE FILTROS NO DASHBOARD E ESTOQUE

document.addEventListener('click', function (event) {
  // --- DASHBOARD ---
  const menuDash = document.getElementById('conteudo-btn-filtro');
  const btnDash  = document.getElementById('btn-filtro-dashboard');

  if (menuDash && menuDash.classList.contains('ativo')) {
    // só fecha se o botão existir e o clique foi fora
    const clicouNoBtnDash = btnDash ? btnDash.contains(event.target) : false;

    if (!menuDash.contains(event.target) && !clicouNoBtnDash) {
      menuDash.classList.remove('ativo');
    }
  }

  // --- ESTOQUE ---
  const menuEst = document.getElementById('conteudo-btn-filtro-estoque');
  const btnEst  = document.getElementById('btn-filtro-estoque');

  if (menuEst && menuEst.classList.contains('ativo')) {
    const clicouNoBtnEst = btnEst ? btnEst.contains(event.target) : false;

    if (!menuEst.contains(event.target) && !clicouNoBtnEst) {
      menuEst.classList.remove('ativo');
    }
  }
});

// ====== FILTRO ESTOQUE ======
window.alternarFiltroEstoque = function () {
  const menu = document.getElementById('conteudo-btn-filtro-estoque');

  if (!menu) return;

  menu.classList.toggle('ativo');
};

// ====== FILTRO DASHBOARD ======
window.alternarFiltroDashboard = function () {
  const menu = document.getElementById('conteudo-btn-filtro');
    if (!menu) return;
    menu.classList.toggle('ativo');
};



//
// =====================================================
// 1) Drag & Drop com ordenação (inserir entre cards)
// =====================================================
(() => {
    const BOARD_SELECTOR = "#colunas";
    const COLUMN_SELECTOR = ".card";
    const ITEM_SELECTOR = ".card-content";
  
    const board = document.querySelector(BOARD_SELECTOR);
    if (!board) return;
  
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
      if (!el.matches(ITEM_SELECTOR)) return;
  
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
        board.querySelectorAll(COLUMN_SELECTOR).forEach((c) => c.classList.remove("over"));
      });
    }
  
    // prepara itens existentes
    board.querySelectorAll(ITEM_SELECTOR).forEach(prepareItem);
  
    // dropzones (colunas)
    board.querySelectorAll(COLUMN_SELECTOR).forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        col.classList.add("over");
        if (!draggedEl) return;
  
        const afterEl = getDragAfterElement(col, e.clientY);
        if (afterEl == null) col.appendChild(draggedEl);
        else col.insertBefore(draggedEl, afterEl);
      });
  
      col.addEventListener("dragleave", () => col.classList.remove("over"));
  
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("over");
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
  })();
  
  // =====================================================
  // 2) Botões de filtro (ativo)
  // =====================================================
  const botoes = document.querySelectorAll(".btn-data");
  botoes.forEach((btn) => {
    btn.addEventListener("click", () => {
      botoes.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
    });
  });
  
  // =====================================================
  // 3) Histórico (abre/fecha)
  // =====================================================
  const btnHistorico = document.getElementById("btn-historico");
  const historico = document.getElementById("historico");
  const overlayHistorico = document.getElementById("overlay");
  const fecharHistoricoBtn = document.querySelector("#historico #header-historico .fa-x");
  
  function abrirHistorico() {
    historico.classList.add("ativo");
    overlayHistorico.classList.add("ativo");
    document.body.style.overflow = "hidden";
  }
  
  function fecharHistorico() {
    historico.classList.remove("ativo");
    overlayHistorico.classList.remove("ativo");
    document.body.style.overflow = "";
  }
  
  btnHistorico?.addEventListener("click", abrirHistorico);
  fecharHistoricoBtn?.addEventListener("click", fecharHistorico);
  overlayHistorico?.addEventListener("click", fecharHistorico);
  
  // =====================================================
  // 4) Criar card (adicionar em uma coluna)
  // =====================================================
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
          Prioridade ${dados.prioridade === "media" ? "Média" : (dados.prioridade[0].toUpperCase() + dados.prioridade.slice(1))}
        </p>
      </div>
    `;
  
    colunaEl.appendChild(card);
    card.setAttribute("draggable", "true");
    return card;
  }
  
  document.querySelectorAll(".adc-atividade").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const coluna = btn.closest(".card");
      adicionarCardNaColuna(coluna, {
        titulo: "Nova atividade",
        descricao: "Descreva aqui...",
        responsavel: "Usuário X",
        prioridade: "baixa",
      });
    });
  });
  
  // =====================================================
  // 5) MENU "..." (Editar / Remover) + MODAL de edição
  // =====================================================
  const taskMenu = document.getElementById("task-menu");
  
  const overlayModal = document.getElementById("overlay-modal");
  const modalEditar = document.getElementById("modal-editar");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");
  const btnSalvarModal = document.getElementById("btn-salvar-modal");
  
  const inputTitulo = document.getElementById("edit-titulo");
  const inputDescricao = document.getElementById("edit-descricao");
  const inputResponsavel = document.getElementById("edit-responsavel");
  const prioridadeBox = document.getElementById("edit-prioridade");
  const prioridadeBtns = prioridadeBox ? prioridadeBox.querySelectorAll("button") : [];
  let prioridadeSelecionada = "baixa";
  // Clique nos botões de prioridade (modal)
  prioridadeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      prioridadeBtns.forEach((b) => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      prioridadeSelecionada = btn.value; // baixa | media | alta
    });
  });
  
  // helper para setar prioridade no modal (quando abrir)
  function setPrioridadeNoModal(valor) {
    prioridadeSelecionada = valor || "baixa";
    prioridadeBtns.forEach((b) => b.classList.toggle("ativo", b.value === prioridadeSelecionada));
  }
  
  
  let cardSelecionado = null;
  
  // ---------- helpers ----------
  function fecharMenu(apagarSelecao = false) {
    taskMenu.classList.remove("ativo");
    taskMenu.style.left = "";
    taskMenu.style.top = "";
    taskMenu.setAttribute("aria-hidden", "true");
  
    // ✅ Só apaga a seleção se eu pedir explicitamente
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
    if (!cardSelecionado) return;
  
    // ler dados do card
    const titulo =
      cardSelecionado.querySelector(".titulo-card-content")?.textContent?.trim() || "";
  
    const descricao =
      cardSelecionado.querySelector(".descricao-card-content")?.textContent?.trim() || "";
  
    // responsável (remove o ícone do texto)
    const responsavelEl = cardSelecionado.querySelector(".nome-usuario");
    const responsavel = responsavelEl
      ? responsavelEl.textContent.replace(/\s+/g, " ").trim().replace(/^.*?\)\s*/, "").replace(/^.*?\s/, "")
      : "";
  
    // prioridade pela classe
    const prEl = cardSelecionado.querySelector(".prioridade");
    const prioridade =
      prEl?.classList.contains("alta") ? "alta" :
      prEl?.classList.contains("media") ? "media" :
      "baixa";
  
    // preencher modal
    inputTitulo.value = titulo;
    inputDescricao.value = descricao;
    inputResponsavel.value = (responsavelEl?.textContent || "").replace("  ", " ").replace("", "").replace("user", "").trim().replace(/^.*\s/, "") || responsavel || "";
    setPrioridadeNoModal(prioridade);
  
    // abrir modal
    overlayModal.classList.add("ativo");
    modalEditar.classList.add("ativo");
    overlayModal.setAttribute("aria-hidden", "false");
    modalEditar.setAttribute("aria-hidden", "false");
  
    document.body.style.overflow = "hidden";
    setTimeout(() => inputTitulo.focus(), 0);
  }
  
  function fecharModal() {
    overlayModal.classList.remove("ativo");
    modalEditar.classList.remove("ativo");
    overlayModal.setAttribute("aria-hidden", "true");
    modalEditar.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  
  function aplicarEdicaoNoCard({ titulo, descricao, responsavel, prioridade }) {
    if (!cardSelecionado) return;
  
    // título
    const tEl = cardSelecionado.querySelector(".titulo-card-content");
    if (tEl) tEl.textContent = titulo;
  
    // descrição (cria/remove)
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
  
    // prioridade texto + classes
    const pEl = cardSelecionado.querySelector(".prioridade");
    if (pEl) {
      pEl.classList.remove("baixa", "media", "alta");
      pEl.classList.add(prioridade);
  
      const texto = prioridade === "media" ? "Média" : (prioridade[0].toUpperCase() + prioridade.slice(1));
      pEl.textContent = `Prioridade ${texto}`;
    }
  }
  
  // ---------- abrir menu ao clicar no "..." ----------
  document.addEventListener("click", (e) => {
    const btnMore = e.target.closest(".more-info");
    if (!btnMore) return;
  
    e.preventDefault();
    e.stopPropagation();
  
    const card = btnMore.closest(".card-content");
    if (!card) return;
  
    // toggle
    if (taskMenu.classList.contains("ativo") && cardSelecionado === card) {
      fecharMenu(false); // ✅ não apaga seleção
      return;
    }
  
    abrirMenuNaPosicao(e.clientX + 8, e.clientY + 8, card);
  });
  
  // ---------- clicar fora fecha menu ----------
  document.addEventListener("click", (e) => {
    if (!taskMenu.classList.contains("ativo")) return;
    const clicouNoMenu = e.target.closest("#task-menu");
    const clicouNoMore = e.target.closest(".more-info");
    if (!clicouNoMenu && !clicouNoMore) fecharMenu(false);
  });
  
  // ---------- ações do menu ----------
  taskMenu.addEventListener("click", (e) => {
    const btn = e.target.closest(".task-menu-btn");
    if (!btn) return;
  
    const action = btn.dataset.action;
  
    if (action === "edit") {
      // ✅ NÃO apaga cardSelecionado aqui
      fecharMenu(false);
      abrirModal();
      return;
    }
  
    if (action === "remove") {
      if (!cardSelecionado) return;
      const alvo = cardSelecionado;
      fecharMenu(true); // ✅ aqui sim apaga seleção
      alvo.remove();
      return;
    }
  });
  
  // ---------- modal: fechar ----------
  btnFecharModal?.addEventListener("click", () => {
    fecharModal();
    // opcional: manter cardSelecionado ou não
  });
  
  btnCancelarModal?.addEventListener("click", () => {
    fecharModal();
  });
  
  overlayModal?.addEventListener("click", () => {
    fecharModal();
  });
  
  // ---------- modal: salvar ----------
  btnSalvarModal?.addEventListener("click", () => {
    if (!cardSelecionado) return;
  
    const titulo = inputTitulo.value.trim();
    if (!titulo) {
      inputTitulo.focus();
      return;
    }
  
    aplicarEdicaoNoCard({
      titulo,
      descricao: inputDescricao.value,
      responsavel: inputResponsavel.value.trim(),
      prioridade: prioridadeSelecionada,
    });
  
    fecharModal();
  });
  
  
  // =====================================================
  // 6) ESC fecha: histórico / menu / modal
  // =====================================================
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
  
    // fecha histórico se estiver aberto
    if (historico?.classList.contains("ativo")) fecharHistorico();
  
    // fecha menu/modal
    if (taskMenu?.classList.contains("ativo")) fecharMenu();
    if (modalEditar?.classList.contains("ativo")) fecharModal();
  });
  
  
  
  