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
        carregarConteudo('dashboard.cfm');
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