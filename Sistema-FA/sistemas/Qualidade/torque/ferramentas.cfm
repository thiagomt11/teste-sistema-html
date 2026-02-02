<cfprocessingdirective pageEncoding="utf-8">

<div id="container">
    
    <header class="content-header">
            <h1>Gestão de Ferramentas</h1>
            <p class="subtitle">Selecione o ambiente para gerenciamento</p>
    </header>

    <div class="options-grid">
        <!-- Cartão de Estoque -->
        <div class="option-card" onclick="carregarConteudo('estoque.cfm')">
            <div class="ferr-icon">
                <span class="material-symbols-outlined">inventory_2</span>
            </div>
            <div class="card-info">
                <h2>Estoque</h2>
                <p>Gerenciamento de estoque e entradas na ferramentaria.</p>
            </div>
            <div class="card-action">
                <span>Acessar Estoque</span>
                <span class="material-symbols-outlined">arrow_forward</span>
            </div>
        </div>

        <!-- Cartão de Linha de Produção -->
        <div class="option-card" onclick="carregarConteudo('linha.cfm')">
            <div class="ferr-icon">
                <span class="material-symbols-outlined">precision_manufacturing</span>
            </div>

            <div class="card-info">
                <h2>Linha de Produção</h2>
                <p>
                    Monitoramento de ferramentas em uso, status e local de operação.
                </p>
            </div>

            <div class="card-action">
                <span>Acessar Linha de Produção</span>
                <span class="material-symbols-outlined">arrow_forward</span>
            </div>
        </div>

        <!-- Cartão de Calibração de Ferramentas -->
        <div class="option-card" onclick="carregarConteudo('calibracao.cfm')">
            <div class="ferr-icon">
                <span class="material-symbols-outlined">check</span>
            </div>

            <div class="card-info">
                <h2>Calibração</h2>
                <p>
                    Controle de calibração e histórico de ferramentas.
                </p>
            </div>

            <div class="card-action">
                <span>Acessar Calibração</span>
                <span class="material-symbols-outlined">arrow_forward</span>
            </div>
        </div>

        <!-- Cartão de Manutenção de Ferramentas -->
        <div class="option-card" onclick="carregarConteudo('manutencao.cfm')">
            <div class="ferr-icon">
                <span class="material-symbols-outlined">build</span>
            </div>

            <div class="card-info">
                <h2>Manutenção</h2>
                <p>
                    Controle de manutenção de ferramentas e lucros associados.
                </p>
            </div>

            <div class="card-action">
                <span>Acessar Manutenção</span>
                <span class="material-symbols-outlined">arrow_forward</span>
            </div>
        </div>

    </div>
</div>

