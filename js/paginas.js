/* ================================================================
   Desafio Dahora — páginas (HTML puro gerado com template strings)
   Cada página é uma função que recebe o elemento onde vai desenhar.
   ================================================================ */

/* ---------- utilitários ---------- */
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
function corAvatar(nome) {
  const cores = ['tomato', 'mustard', 'sage', 'slate'];
  let h = 0;
  const s = String(nome || '');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 997;
  return cores[h % cores.length];
}
const FORMATO_PONTOS = new Intl.NumberFormat('pt-BR');
const pts = (n) => FORMATO_PONTOS.format(n);
const ehAdminOuMonitor = (u) => u && (u.papel === 'ADMIN' || u.papel === 'MONITOR');

/* Estado de tela que sobrevive a re-renderizações (por página) */
const estado = {
  ranking: { nivel: 'geral', dia: 1, desafioId: '', info: false },
  desafios: { dia: 1, aberto: null },
  avaliacoes: { dia: 'todos', equipe: 'todas' },
  cartas: { aba: 'inventario', selecionada: null, erro: '', sucesso: '' },
  quadro: { compondo: null, cartaoAberto: null },
  perfil: { editando: false },
};

/* ================================================================
   PAINEL (dashboard do participante)
   ================================================================ */
function paginaPainel(el, ctx) {
  const u = ctx.usuario;
  const rk = u.equipeId ? ranking('geral').find((r) => r.equipeId === u.equipeId) : null;
  const atual = db().desafios.find((d) => d.status === 'EM_ANDAMENTO');
  const cartasEquipe = u.equipeId ? db().cartas.filter((c) => c.equipeId === u.equipeId) : [];

  el.innerHTML = `
  <div class="dashboard" id="topo">
    <section class="hero">
      <div class="hero-text">
        <h1>Desafio da Hora</h1>
        <p>36 desafios, 3 dias, 1 hora por rodada. Acompanhe sua equipe e o desafio da vez.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/ranking">Ver ranking</a>
          <a class="btn btn-outline" href="#/desafios">Ver desafios</a>
        </div>
        <div class="hero-stats">
          <div><strong>${rk ? pts(rk.pontuacao) : 0}</strong><span>Pontos (geral)</span></div>
          <div><strong>${rk ? '#' + rk.posicao : '—'}</strong><span>Posição no ranking</span></div>
          <div><strong>${rk ? rk.desafiosConcluidos : 0}/${TOTAL_DESAFIOS}</strong><span>Desafios concluídos</span></div>
        </div>
      </div>
      <aside class="hero-card">
        <div class="hero-card-art dashboard-mascot-art" aria-label="Mascote animado do Desafio Dahora">
          ${mascoteHTML()}
        </div>
        <div class="hero-card-info">
          <div><small>Minha equipe</small><span>${esc(u.equipe?.nome || 'Sem equipe ainda')}</span></div>
          <div><small>Cartas bônus usadas</small><strong>${cartasEquipe.length}</strong></div>
          <a class="btn btn-primary btn-sm" href="#/equipes">Ver equipes</a>
        </div>
      </aside>
    </section>

    <section class="board-section" id="desafio-atual">
      <h2 class="section-title">Desafio da hora</h2>
      ${atual ? `
        <div class="desafio-card" style="max-width:420px">
          <div class="desafio-card-topo">
            <span class="desafio-pontos-badge">${DESAFIO_STATUS_ICON[atual.status]} ${DESAFIO_STATUS_LABELS[atual.status]}</span>
            <span class="desafio-prazo">Dia ${atual.dia} · #${atual.numero}</span>
          </div>
          <p class="desafio-titulo">${esc(atual.titulo)}</p>
          ${atual.descricao ? `<p class="desafio-descricao">${esc(atual.descricao)}</p>` : ''}
          ${atual.instrucoes ? `<p class="desafio-descricao">${esc(atual.instrucoes)}</p>` : ''}
        </div>` : `<p class="empty" style="text-align:center">Nenhum desafio em andamento agora. Acompanhe a aba "Desafios".</p>`}
    </section>
  </div>`;
}

function mascoteHTML() {
  return `
  <div class="dashboard-mascot-stage mascot-stage">
    <div class="mascot-orbit mascot-orbit-a"></div>
    <div class="mascot-orbit mascot-orbit-b"></div>
    <div class="mascot-platform"><span></span></div>
    <div class="mascot-spark mascot-spark-one">✦</div>
    <div class="mascot-spark mascot-spark-two">✧</div>
    <div class="mascot-spark mascot-spark-three">+</div>
    <img class="dh-mascot dh-robot-mascot" src="img/mascote-dahora.svg" alt="Dahora, robô mascote do Desafio Dahora, acenando" />
    <div class="mascot-hud mascot-hud-left"><span>XP</span><strong>+250</strong><i></i></div>
    <div class="mascot-hud mascot-hud-right"><span>MISSÃO</span><strong>EM EQUIPE</strong><i></i></div>
  </div>`;
}

/* ================================================================
   EQUIPES (somente visualização)
   ================================================================ */
function cartaoEquipeHTML(equipe, destaque) {
  const cor = corPorChave(equipe.cor);
  const total = equipe.participantes.length;
  return `
  <div class="equipe-card${destaque ? ' equipe-card-destaque' : ''}" style="--equipe-cor:${cor.hex}">
    ${destaque ? '<span class="equipe-card-destaque-selo">Você está aqui</span>' : ''}
    <div class="equipe-card-faixa"></div>
    <div class="equipe-card-header"><h2>${esc(equipe.nome)}</h2></div>
    <span class="equipe-card-tag">${esc(cor.nome)}</span>
    ${total < 3 ? '<p class="quick-add-card-erro">Faltam participantes (mínimo 3).</p>' : ''}
    <div class="equipe-membros">
      ${total === 0 ? '<p class="empty">Sem membros ainda.</p>' : equipe.participantes.map((p) => `
        <span class="equipe-membro-chip"><span class="equipe-membro-avatar">${esc(iniciais(p.nome))}</span>${esc(p.nome)}</span>`).join('')}
    </div>
  </div>`;
}

function paginaEquipes(el, ctx) {
  const u = ctx.usuario;
  const todas = equipesComMembros();
  const minha = todas.find((e) => e.id === u.equipeId);
  const outras = todas.filter((e) => !minha || e.id !== minha.id);

  el.innerHTML = `
  <div class="dashboard equipes">
    <header><h1>Equipes</h1></header>
    ${todas.length === 0 ? '<p class="empty">Nenhuma equipe criada ainda.</p>' : `
      ${minha ? `
        <div class="equipe-destaque-section">
          <h2 class="equipe-secao-titulo-destaque" style="--equipe-destaque-cor:${corPorChave(minha.cor).hex}">Sua equipe</h2>
          ${cartaoEquipeHTML(minha, true)}
        </div>` : ''}
      ${outras.length ? `
        ${minha ? '<h2 class="equipe-secao-titulo">Outras equipes</h2>' : ''}
        <div class="equipes-grid">${outras.map((e) => cartaoEquipeHTML(e, false)).join('')}</div>` : ''}
    `}
  </div>`;
}

/* ================================================================
   DESAFIOS (somente visualização — só aparecem os que já começaram)
   ================================================================ */
const COLUNAS_DESAFIO = ['EM_ANDAMENTO', 'EM_AVALIACAO', 'FINALIZADO'];

function paginaDesafios(el, ctx) {
  const st = estado.desafios;
  const doDia = db().desafios.filter((d) => d.dia === st.dia).sort((a, b) => a.numero - b.numero);
  const iniciados = doDia.filter((d) => COLUNAS_DESAFIO.includes(d.status));

  const colunas = COLUNAS_DESAFIO.map((status) => {
    const itens = iniciados.filter((d) => d.status === status);
    return `
    <div class="board-slot">
      <div class="order-column">
        <div class="order-column-header">
          <h2>${DESAFIO_STATUS_ICON[status]} ${DESAFIO_STATUS_LABELS[status]}</h2>
          <span class="count">${itens.length}</span>
        </div>
        <div class="order-column-list">
          ${itens.length === 0 ? '<p class="empty">Nenhum desafio aqui.</p>' : itens.map((d) => `
            <div class="desafio-card" data-abrir="${esc(d.id)}" style="cursor:pointer">
              <div class="desafio-card-topo">
                <span class="desafio-pontos-badge">${DESAFIO_STATUS_ICON[d.status]} ${DESAFIO_STATUS_LABELS[d.status]}</span>
                <span class="desafio-prazo">#${d.numero}</span>
              </div>
              <p class="desafio-titulo">${esc(d.titulo)}</p>
              ${d.categoria ? `<p class="desafio-descricao">${esc(d.categoria)}</p>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');

  const aberto = st.aberto ? desafioPorId(st.aberto) : null;
  const avals = aberto ? db().avaliacoes.filter((a) => a.desafioId === aberto.id) : [];

  el.innerHTML = `
  <div class="dashboard desafios">
    <header><h1>Desafios</h1></header>
    <div class="equipes-toolbar">
      ${DIAS.map((d) => `<button type="button" class="btn ${st.dia === d.dia ? 'btn-primary' : 'btn-outline'} btn-sm" data-dia="${d.dia}">${esc(d.titulo)} · ${esc(d.categoria)}</button>`).join('')}
    </div>
    <div class="board board-section">${colunas}</div>
    ${iniciados.length === 0 ? '<p class="empty" style="text-align:center">Os desafios deste dia aparecem aqui assim que começarem.</p>' : ''}

    ${aberto ? `
    <div class="avaliacao-modal-backdrop" data-fechar-fundo>
      <section class="avaliacao-modal" role="dialog" aria-modal="true" aria-labelledby="avaliacao-modal-titulo">
        <div class="avaliacao-modal-cabecalho">
          <div>
            <p class="avaliacao-modal-eyebrow">DESAFIO ${aberto.numero} · DIA ${aberto.dia}</p>
            <h2 id="avaliacao-modal-titulo">${esc(aberto.titulo)}</h2>
          </div>
          <button type="button" class="avaliacao-modal-fechar" data-fechar aria-label="Fechar">×</button>
        </div>
        <div class="info-box" style="margin-top:12px">
          ${aberto.descricao ? `<p style="margin-bottom:8px">${esc(aberto.descricao)}</p>` : ''}
          ${aberto.instrucoes ? `<p style="margin-bottom:8px"><strong>Instruções:</strong> ${esc(aberto.instrucoes)}</p>` : ''}
          ${avals.length ? `<p><strong>Notas já registradas:</strong></p>
            ${avals.map((a) => `<p>${esc(equipePorId(a.equipeId)?.nome || 'Equipe')}: <strong>${a.pontuacaoTotal}</strong>/${PONTUACAO_MAXIMA} pts</p>`).join('')}` : '<p>Ainda não há notas para este desafio.</p>'}
        </div>
      </section>
    </div>` : ''}
  </div>`;

  el.onclick = (e) => {
    const dia = e.target.closest('[data-dia]');
    if (dia) { st.dia = Number(dia.dataset.dia); st.aberto = null; return ctx.atualizar(); }
    const card = e.target.closest('[data-abrir]');
    if (card) { st.aberto = card.dataset.abrir; return ctx.atualizar(); }
    if (e.target.closest('[data-fechar]') || e.target.matches('[data-fechar-fundo]')) { st.aberto = null; ctx.atualizar(); }
  };
}

/* ================================================================
   QUADRO (estilo Trello, por equipe)
   ================================================================ */
function paginaQuadro(el, ctx) {
  const u = ctx.usuario;
  const st = estado.quadro;

  if (!u.equipeId) {
    el.innerHTML = `
    <div class="dashboard quadro-page">
      <div class="trello-empty-state">
        <div class="trello-empty-icon">▦</div>
        <h1>Você ainda não está em uma equipe</h1>
        <p>Entre em <a href="#/equipes">Equipes</a> para participar de uma equipe e usar o quadro.</p>
      </div>
    </div>`;
    return;
  }

  const colunas = colunasDaEquipe(u.equipeId);
  const seletorCores = (valor, extra) => `
    <div class="trello-label-picker"${extra || ''}>
      <span>Etiqueta</span>
      <div>
        <button type="button" class="label-none ${!valor ? 'selected' : ''}" data-cor="">×</button>
        ${PALETA_CORES.map((c) => `<button type="button" class="${valor === c.chave ? 'selected' : ''}" style="background:${c.hex}" title="${c.nome}" data-cor="${c.chave}"></button>`).join('')}
      </div>
    </div>`;

  const cartaoHTML = (c) => {
    const cor = c.cor ? corPorChave(c.cor) : null;
    return `
    <article class="trello-card" draggable="true" data-cartao="${esc(c.id)}">
      ${cor ? `<span class="trello-card-label" style="background:${cor.hex}" title="${esc(cor.nome)}"></span>` : ''}
      <div class="trello-card-title">${esc(c.titulo)}</div>
      ${c.descricao ? '<div class="trello-card-footer"><span>☷</span></div>' : ''}
    </article>`;
  };

  const colunaHTML = (col) => `
    <div class="trello-list-wrap">
      <section class="trello-list" data-coluna="${esc(col.id)}">
        <header class="trello-list-header">
          <span class="trello-list-name trello-list-name-fixo">${esc(col.nome)}</span>
          <span class="trello-list-count">${col.cartoes.length}</span>
        </header>
        <div class="trello-cards">
          ${col.cartoes.map(cartaoHTML).join('')}
          ${col.cartoes.length === 0 ? '<div class="trello-drop-empty">Nenhum cartão ainda</div>' : ''}
        </div>
        ${st.compondo === col.id ? `
          <form class="trello-card-composer" data-form-novo="${esc(col.id)}">
            <input name="titulo" placeholder="Título da tarefa..." autocomplete="off" />
            <textarea name="descricao" placeholder="O que a equipe está fazendo? (mínimo de 5 caracteres)" rows="3" minlength="5" required></textarea>
            ${seletorCores(null, ' data-picker="novo"')}
            <input type="hidden" name="cor" value="" />
            <div class="trello-form-actions"><button type="submit">Adicionar cartão</button><button type="button" data-cancelar-novo>×</button></div>
          </form>` : `<button type="button" class="trello-add-card" data-novo="${esc(col.id)}">＋ Adicionar um cartão</button>`}
      </section>
    </div>`;

  let modal = '';
  const sel = st.cartaoAberto ? achaCartao(st.cartaoAberto) : null;
  if (sel) {
    const c = sel.cartao;
    modal = `
    <div class="trello-modal-backdrop" data-fundo>
      <div class="trello-modal" role="dialog" aria-modal="true">
        <button class="trello-modal-close" data-fechar-modal>×</button>
        <div class="trello-modal-main">
          <div class="trello-modal-icon">▣</div>
          <div class="trello-modal-content">
            <input class="trello-modal-title" id="m-titulo" value="${esc(c.titulo)}" />
            <p class="trello-modal-subtitle">em <strong>${esc(sel.coluna.nome)}</strong> · ${esc(u.equipe?.nome || '')}</p>
            <h3>Descrição</h3>
            <textarea id="m-descricao" placeholder="Adicione uma descrição mais detalhada...">${esc(c.descricao || '')}</textarea>
            <h3>Etiquetas</h3>
            ${seletorCores(c.cor, ' data-picker="modal"')}
            <div class="trello-modal-actions">
              <button type="button" class="trello-save" data-salvar-modal>Salvar alterações</button>
              <button type="button" class="trello-delete" data-excluir-modal>Excluir cartão</button>
            </div>
          </div>
        </div>
        <aside class="trello-modal-side">
          <strong>Adicionar ao cartão</strong>
          <button type="button" data-foco="#m-descricao">☷ Descrição</button>
          <button type="button" data-foco=".trello-modal-content .trello-label-picker button">▰ Etiqueta</button>
          <span class="trello-side-note">As alterações são salvas no quadro da equipe.</span>
        </aside>
      </div>
    </div>`;
  }

  el.innerHTML = `
  <div>
    <section class="quadro-tutorial" aria-label="Demonstração de como usar o quadro">
      <div class="quadro-tutorial-copy">
        <span class="quadro-tutorial-kicker"><span class="tutorial-live-dot"></span> GUIA INTERATIVO</span>
        <h2>Veja uma tarefa ganhar vida</h2>
        <p>O cartão de demonstração percorre as etapas automaticamente. Depois, arraste seus próprios cartões para acompanhar o trabalho da equipe.</p>
      </div>
      <div class="tutorial-track" aria-label="Exemplo animado passando por Pendente, Andamento e Concluído">
        <div class="tutorial-track-line"></div>
        <div class="tutorial-stage"><span class="tutorial-stage-icon">◷</span><strong>Pendente</strong><small>Planejar</small></div>
        <div class="tutorial-stage"><span class="tutorial-stage-icon">⚡</span><strong>Andamento</strong><small>Executar</small></div>
        <div class="tutorial-stage"><span class="tutorial-stage-icon">✓</span><strong>Concluído</strong><small>Entregar</small></div>
        <div class="tutorial-moving-card"><span class="tutorial-card-spark">✦</span><span><b>EXEMPLO</b><small>Organizar a próxima tarefa</small></span><span class="tutorial-card-check">✓</span></div>
      </div>
    </section>
    <div class="trello-canvas">
      <div class="trello-lists trello-lists-fixo">${colunas.map(colunaHTML).join('')}</div>
    </div>
    ${modal}
  </div>`;

  /* ----- cliques ----- */
  let corModal = sel ? (sel.cartao.cor || null) : null;
  const marcaCor = (picker, valor) => {
    picker.querySelectorAll('button').forEach((b) => b.classList.toggle('selected', (b.dataset.cor || '') === (valor || '')));
  };

  el.onclick = (e) => {
    const t = e.target;
    const novo = t.closest('[data-novo]');
    if (novo) { st.compondo = novo.dataset.novo; return ctx.atualizar(); }
    if (t.closest('[data-cancelar-novo]')) { st.compondo = null; return ctx.atualizar(); }

    const cor = t.closest('[data-cor]');
    if (cor) {
      const picker = cor.closest('[data-picker]');
      const valor = cor.dataset.cor || null;
      if (picker.dataset.picker === 'novo') {
        picker.closest('form').elements.cor.value = valor || '';
      } else {
        corModal = valor;
      }
      return marcaCor(picker, valor);
    }

    const foco = t.closest('[data-foco]');
    if (foco) { document.querySelector(foco.dataset.foco)?.focus(); return; }

    if (t.closest('[data-fechar-modal]') || t.matches('[data-fundo]')) { st.cartaoAberto = null; return ctx.atualizar(); }
    if (t.closest('[data-salvar-modal]')) {
      const titulo = el.querySelector('#m-titulo').value.trim();
      if (!titulo) return;
      editarCartao(st.cartaoAberto, { titulo, descricao: el.querySelector('#m-descricao').value, cor: corModal });
      return ctx.atualizar();
    }
    if (t.closest('[data-excluir-modal]')) {
      if (window.confirm('Excluir este cartão?')) { excluirCartao(st.cartaoAberto); st.cartaoAberto = null; ctx.atualizar(); }
      return;
    }
    const card = t.closest('[data-cartao]');
    if (card) { st.cartaoAberto = card.dataset.cartao; ctx.atualizar(); }
  };

  el.onsubmit = (e) => {
    const form = e.target.closest('[data-form-novo]');
    if (!form) return;
    e.preventDefault();
    const titulo = form.elements.titulo.value.trim();
    const descricao = form.elements.descricao.value.trim();
    if (!titulo || descricao.length < 5) return;
    criarCartao(form.dataset.formNovo, { titulo, descricao, cor: form.elements.cor.value || null });
    st.compondo = null;
    ctx.atualizar();
  };

  // Esc fecha o cartão aberto (ouvinte global, trocado a cada desenho da página)
  if (window.__quadroEsc) document.removeEventListener('keydown', window.__quadroEsc);
  window.__quadroEsc = (e) => {
    if (e.key === 'Escape' && st.cartaoAberto && paginaAtual === paginaQuadro) { st.cartaoAberto = null; ctx.atualizar(); }
  };
  document.addEventListener('keydown', window.__quadroEsc);

  /* ----- arrastar e soltar ----- */
  let arrastandoId = null;
  let alvo = null; // { colunaId, index }

  const limparLinha = () => el.querySelectorAll('.trello-drop-line').forEach((n) => n.remove());
  const limparSobre = () => el.querySelectorAll('.trello-list.drag-over').forEach((n) => n.classList.remove('drag-over'));

  el.ondragstart = (e) => {
    const card = e.target.closest('[data-cartao]');
    if (!card) return;
    arrastandoId = card.dataset.cartao;
    try { e.dataTransfer.setData('text/plain', arrastandoId); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* ok */ }
    setTimeout(() => card.classList.add('is-dragging'), 0);
  };
  el.ondragover = (e) => {
    if (!arrastandoId) return;
    const lista = e.target.closest('[data-coluna]');
    if (!lista) return;
    e.preventDefault();
    const cartoes = [...lista.querySelectorAll('[data-cartao]')];
    let index = cartoes.length;
    let referencia = null;
    let depois = true;
    const cardAlvo = e.target.closest('[data-cartao]');
    if (cardAlvo) {
      const r = cardAlvo.getBoundingClientRect();
      const i = cartoes.indexOf(cardAlvo);
      if (e.clientY < r.top + r.height / 2) { index = i; depois = false; } else { index = i + 1; }
      referencia = cardAlvo;
    } else if (cartoes.length) {
      referencia = cartoes[cartoes.length - 1];
    }
    alvo = { colunaId: lista.dataset.coluna, index };
    limparLinha(); limparSobre();
    lista.classList.add('drag-over');
    const linha = document.createElement('div');
    linha.className = 'trello-drop-line';
    if (referencia) {
      if (depois) referencia.after(linha); else referencia.before(linha);
    } else {
      lista.querySelector('.trello-cards').appendChild(linha);
    }
  };
  el.ondrop = (e) => {
    if (!arrastandoId) return;
    e.preventDefault();
    const id = arrastandoId;
    const destino = alvo;
    arrastandoId = null; alvo = null;
    if (destino) moverCartao(id, destino.colunaId, destino.index);
    ctx.atualizar();
  };
  el.ondragend = () => {
    arrastandoId = null; alvo = null;
    limparLinha(); limparSobre();
    el.querySelectorAll('.is-dragging').forEach((n) => n.classList.remove('is-dragging'));
  };
}

/* ================================================================
   CARTAS DE PODER
   ================================================================ */
const ICONES_CARTA = { AULA: '📚', MENTOR: '🧑‍🏫', DICA: '💡' };
const NOMES_CARTA = { AULA: 'Aula', MENTOR: 'Mentoria', DICA: 'Dica' };

function paginaCartas(el, ctx) {
  const u = ctx.usuario;
  const st = estado.cartas;
  const equipe = u.equipe;
  const usadas = equipe ? db().cartas.filter((c) => c.equipeId === equipe.id) : [];
  const liberadas = new Set(db().desbloqueadas);
  const desafiosAtivos = db().desafios.filter((d) => ['DISPONIVEL', 'EM_ANDAMENTO'].includes(d.status));

  const cartas = TIPOS_CARTA.map((c) => {
    const usos = usadas.filter((x) => x.tipo === c.valor);
    return {
      ...c, icone: ICONES_CARTA[c.valor], desbloqueada: liberadas.has(c.valor),
      usadaHoje: usos.some((x) => diaRecife(x.horario) === diaRecife()),
    };
  });
  const selecionada = cartas.find((c) => c.valor === st.selecionada) || null;

  const corpo = st.aba === 'codigo' ? `
    <section class="codigo-painel">
      <div class="codigo-ilustracao">🔑</div>
      <span class="cartas-kicker">ACESSO ESPECIAL</span>
      <h2>Você recebeu um código?</h2>
      <p>Digite o código fornecido pela organização para liberar uma carta de Aula, Mentoria ou Dica no seu inventário. (Na demonstração, use AULA, MENTOR ou DICA.)</p>
      <form class="codigo-form" data-form-codigo>
        <label for="codigo-carta">Código de desbloqueio</label>
        <input id="codigo-carta" name="codigo" placeholder="EX.: ABCDE-FG234" maxlength="30" autocomplete="off" required />
        <button class="btn btn-primary" type="submit">Validar e liberar carta</button>
      </form>
      <small class="codigo-nota">Cada código é individual e pode ser resgatado uma única vez.</small>
    </section>` : `
    ${!equipe ? '<div class="cartas-alerta">Você ainda não está em uma equipe. Entre em uma equipe para poder usar as cartas.</div>'
      : `<div class="cartas-equipe"><span>⚡ Sua equipe</span><strong>${esc(equipe.nome)}</strong><small>As cartas utilizadas ficam registradas no histórico da equipe.</small></div>`}
    <section class="cartas-grid">
      ${cartas.map((c) => {
        const bloq = !c.desbloqueada || c.usadaHoje;
        return `
        <button type="button" ${bloq ? 'disabled' : ''} data-carta="${c.valor}" class="carta-card ${selecionada?.valor === c.valor ? 'selecionada' : ''} ${bloq ? 'carta-bloqueada' : ''}">
          <span class="carta-glow"></span>
          <span class="carta-icon">${c.usadaHoje ? '✓' : c.desbloqueada ? c.icone : '🔒'}</span>
          <span class="carta-tag">${c.usadaHoje ? 'JÁ USADA HOJE' : c.desbloqueada ? 'CARTA DESBLOQUEADA' : 'CARTA BLOQUEADA'}</span>
          <strong>${esc(c.label.replace('Carta ', ''))}</strong><span class="carta-desc">${esc(c.descricao)}</span>
          <span class="carta-footer"><b>${c.usadaHoje ? 'DISPONÍVEL AMANHÃ' : c.desbloqueada ? 'ATIVAR' : 'USE UM CÓDIGO'}</b><span>${c.desbloqueada && !c.usadaHoje ? '10 min' : c.usadaHoje ? '✓' : '🔐'}</span></span>
        </button>`;
      }).join('')}
    </section>
    ${selecionada && selecionada.desbloqueada ? `
    <form class="ativar-carta" data-form-usar>
      <div><span class="cartas-kicker">CARTA SELECIONADA</span><h2>${selecionada.icone} ${esc(selecionada.label)}</h2><p>${esc(selecionada.descricao)}</p></div>
      <label>Em qual desafio usar?
        <select name="desafio" required><option value="">Selecione um desafio</option>
          ${desafiosAtivos.map((d) => `<option value="${esc(d.id)}">#${d.numero} — ${esc(d.titulo)}</option>`).join('')}
        </select></label>
      <button class="btn btn-primary" type="submit">Usar carta agora</button>
    </form>` : ''}
    <section class="historico-cartas">
      <div class="secao-titulo"><div><span class="cartas-kicker">REGISTRO</span><h2>Cartas utilizadas</h2></div><span>${usadas.length} uso(s)</span></div>
      ${usadas.length === 0 ? '<p class="empty">Sua equipe ainda não utilizou nenhuma carta.</p>' : `
        <div class="historico-lista">${[...usadas].reverse().slice(0, 8).map((c) => {
          const d = desafioPorId(c.desafioId);
          return `<div class="historico-item"><span class="historico-icon">${ICONES_CARTA[c.tipo]}</span>
            <div><strong>${esc(NOMES_CARTA[c.tipo] || c.tipo)}</strong><small>${d ? `Desafio #${d.numero} — ${esc(d.titulo)}` : 'Desafio não informado'}</small></div>
            <b>−${c.tempoUtilizado} min</b></div>`;
        }).join('')}</div>`}
    </section>`;

  el.innerHTML = `
  <div class="dashboard cartas-page">
    <header class="cartas-header">
      <div><span class="cartas-kicker">INVENTÁRIO DE VANTAGENS</span><h1>Cartas de Poder</h1><p>Desbloqueie cartas com um código e use suas vantagens durante os desafios.</p></div>
      <div class="cartas-tempo"><strong>−10 min</strong><span>por uso</span></div>
    </header>
    <nav class="cartas-abas" aria-label="Seções de cartas">
      <button type="button" class="${st.aba === 'inventario' ? 'ativa' : ''}" data-aba="inventario">Minhas cartas <span>${liberadas.size}</span></button>
      <button type="button" class="${st.aba === 'codigo' ? 'ativa' : ''}" data-aba="codigo">🔐 Desbloquear com código</button>
    </nav>
    ${corpo}
    ${st.sucesso ? `<div class="cartas-sucesso" role="status">✓ ${esc(st.sucesso)}</div>` : ''}
    ${st.erro ? `<div class="cartas-erro" role="alert">${esc(st.erro)}</div>` : ''}
  </div>`;

  el.onclick = (e) => {
    const aba = e.target.closest('[data-aba]');
    if (aba) { st.aba = aba.dataset.aba; st.erro = ''; st.sucesso = ''; return ctx.atualizar(); }
    const carta = e.target.closest('[data-carta]');
    if (carta && !carta.disabled) { st.selecionada = carta.dataset.carta; st.erro = ''; st.sucesso = ''; ctx.atualizar(); }
  };
  el.onsubmit = (e) => {
    e.preventDefault();
    if (e.target.matches('[data-form-codigo]')) {
      try {
        const tipo = desbloquearCarta(e.target.elements.codigo.value);
        st.sucesso = `Carta ${NOMES_CARTA[tipo]} desbloqueada com sucesso!`; st.erro = ''; st.aba = 'inventario';
      } catch (err) { st.erro = err.message; st.sucesso = ''; }
      return ctx.atualizar();
    }
    if (e.target.matches('[data-form-usar]')) {
      const desafioId = e.target.elements.desafio.value;
      if (!selecionada || !equipe || !desafioId) return;
      usarCarta({ equipeId: equipe.id, desafioId, tipo: selecionada.valor, responsavel: u.nome });
      st.sucesso = `${selecionada.label} ativada! Foram utilizados 10 minutos do tempo da equipe.`; st.erro = ''; st.selecionada = null;
      ctx.atualizar();
    }
  };
}

/* ================================================================
   RANKING
   ================================================================ */
function paginaRanking(el, ctx) {
  const st = estado.ranking;
  const desafios = db().desafios;
  if (!st.desafioId && desafios[0]) st.desafioId = desafios[0].id;
  const dados = st.nivel === 'rodada' ? ranking('rodada', st.desafioId) : st.nivel === 'diario' ? ranking('diario', st.dia) : ranking('geral');
  const top3 = dados.slice(0, 3);
  const resto = dados.slice(3);
  const temAlgo = dados.some((d) => d.pontuacao > 0);

  const ORDEM = [2, 1, 3];
  const podio = `
  <div class="podium">
    ${ORDEM.map((pos) => {
      const item = top3[pos - 1];
      if (!item) return `<div class="podium-spot podium-empty"></div>`;
      return `
      <div class="podium-spot podium-pos-${pos}">
        ${pos === 1 ? '<span class="podium-crown">♛</span>' : ''}
        <div class="podium-avatar" style="background:${corPorChave(item.cor).hex}">${esc(item.nome.slice(0, 2).toUpperCase())}<span class="podium-badge">${pos}</span></div>
        <p class="podium-nome">${esc(item.nome)}</p>
        <p class="podium-valor">${pts(item.pontuacao)} pts</p>
      </div>`;
    }).join('')}
  </div>`;

  el.innerHTML = `
  <div class="dashboard ranking">
    <header>
      <h1>Ranking das equipes</h1>
      <button type="button" class="info-link" data-info>ⓘ Como isso funciona?</button>
    </header>
    ${st.info ? `<p class="info-box"><strong>Rodada</strong>: pontuação de um desafio específico. <strong>Diário</strong>: soma de todos os desafios já avaliados naquele dia. <strong>Geral</strong>: soma acumulada dos três dias.</p>` : ''}
    <div class="ranking-toolbar">
      <select data-nivel>
        <option value="geral" ${st.nivel === 'geral' ? 'selected' : ''}>Ranking geral</option>
        <option value="diario" ${st.nivel === 'diario' ? 'selected' : ''}>Ranking diário</option>
        <option value="rodada" ${st.nivel === 'rodada' ? 'selected' : ''}>Ranking da rodada</option>
      </select>
      ${st.nivel === 'diario' ? `<select data-dia>${DIAS.map((d) => `<option value="${d.dia}" ${st.dia === d.dia ? 'selected' : ''}>${esc(d.titulo)}</option>`).join('')}</select>` : ''}
      ${st.nivel === 'rodada' ? `<select data-desafio>${desafios.map((d) => `<option value="${esc(d.id)}" ${st.desafioId === d.id ? 'selected' : ''}>#${d.numero} — ${esc(d.titulo)}</option>`).join('')}</select>` : ''}
    </div>
    ${!temAlgo ? '<p class="empty">Nenhuma avaliação registrada ainda para esse filtro.</p>' : `
      ${podio}
      ${resto.length ? `
      <div class="ranking-list">
        <div class="ranking-list-header"><span>Classificação</span><span>Pontos</span></div>
        ${resto.map((item) => `
          <div class="ranking-row">
            <span class="ranking-posicao">${item.posicao}</span>
            <div class="ranking-avatar" style="background:${corPorChave(item.cor).hex}">${esc(item.nome.slice(0, 2).toUpperCase())}</div>
            <span class="ranking-nome">${esc(item.nome)}</span>
            <span class="ranking-valor">${pts(item.pontuacao)} pts</span>
          </div>`).join('')}
      </div>` : ''}`}
  </div>`;

  el.onclick = (e) => { if (e.target.closest('[data-info]')) { st.info = !st.info; ctx.atualizar(); } };
  el.onchange = (e) => {
    if (e.target.matches('[data-nivel]')) st.nivel = e.target.value;
    if (e.target.matches('[data-dia]')) st.dia = Number(e.target.value);
    if (e.target.matches('[data-desafio]')) st.desafioId = e.target.value;
    ctx.atualizar();
  };
}

/* ================================================================
   AVALIAÇÕES (histórico)
   ================================================================ */
function paginaAvaliacoes(el, ctx) {
  const st = estado.avaliacoes;
  const d = db();
  const comDados = d.avaliacoes.map((a) => ({ ...a, equipe: equipePorId(a.equipeId), desafio: desafioPorId(a.desafioId) }));
  const doDia = comDados.filter((a) => st.dia === 'todos' || String(a.desafio?.dia) === String(st.dia));
  const equipes = [...new Map(doDia.map((a) => [a.equipeId, a.equipe])).values()].filter(Boolean).sort((a, b) => a.nome.localeCompare(b.nome));
  const lista = doDia.filter((a) => st.equipe === 'todas' || a.equipeId === st.equipe);

  const porDia = {};
  lista.forEach((a) => {
    const dia = `Dia ${a.desafio?.dia ?? '?'}`;
    const nome = a.equipe?.nome || 'Equipe sem nome';
    ((porDia[dia] ||= {})[nome] ||= []).push(a);
  });
  Object.values(porDia).forEach((eq) => Object.values(eq).forEach((provas) => provas.sort((a, b) => (a.desafio?.numero ?? 0) - (b.desafio?.numero ?? 0))));

  const secoes = Object.entries(porDia).map(([titulo, equipesDoDia]) => {
    const total = Object.values(equipesDoDia).reduce((n, p) => n + p.length, 0);
    return `
    <section class="historico-dia">
      <div class="historico-dia-titulo"><h2>${esc(titulo)}</h2><span>${total} avaliação(ões)</span></div>
      ${Object.entries(equipesDoDia).sort(([a], [b]) => a.localeCompare(b)).map(([nomeEquipe, provas]) => `
        <section class="historico-equipe-grupo">
          <div class="historico-equipe-cabecalho"><span class="historico-equipe-icone">♟</span><div><h3>${esc(nomeEquipe)}</h3><p>${provas.length} prova(s) avaliada(s) neste dia</p></div></div>
          <div class="historico-grid">${provas.map((a) => `
            <article class="historico-card">
              <div class="historico-card-topo"><div><span class="historico-prova">Prova ${a.desafio?.numero ?? '—'}</span><h3>${esc(a.desafio?.titulo || 'Desafio')}</h3></div>
                <div class="historico-nota"><strong>${a.pontuacaoTotal}</strong><span>/${PONTUACAO_MAXIMA} pts</span></div></div>
              <div class="historico-barra"><span style="width:${Math.min(100, (a.pontuacaoTotal / PONTUACAO_MAXIMA) * 100)}%"></span></div>
              <div class="historico-criterios">${CRITERIOS.map((c) => `<div><span>${esc(c.label)}</span><strong>${a[c.chave] ?? 0}/${c.max}</strong></div>`).join('')}</div>
              ${a.feedback ? `<div class="historico-feedback"><strong>Feedback</strong><p>${esc(a.feedback)}</p></div>` : '<p class="historico-sem-feedback">Nenhum feedback registrado.</p>'}
              <footer>Última atualização: ${new Date(a.updatedAt || a.createdAt).toLocaleString('pt-BR')}</footer>
            </article>`).join('')}</div>
        </section>`).join('')}
    </section>`;
  }).join('');

  el.innerHTML = `
  <div class="dashboard historico-avaliacoes">
    <header class="historico-cabecalho">
      <div><p class="historico-kicker">DESEMPENHO DAS EQUIPES</p><h1>Histórico de avaliações</h1><p>Consulte as notas e os feedbacks organizados por dia e desafio.</p></div>
      <div class="historico-total"><strong>${lista.length}</strong><span>avaliações</span></div>
    </header>
    <div class="historico-filtros">
      <label>Dia do evento<select data-f-dia><option value="todos">Todos os dias</option>${DIAS.map((x) => `<option value="${x.dia}" ${String(st.dia) === String(x.dia) ? 'selected' : ''}>${esc(x.titulo)}</option>`).join('')}</select></label>
      <label>Equipe<select data-f-equipe><option value="todas">Todas as equipes</option>${equipes.map((eq) => `<option value="${esc(eq.id)}" ${st.equipe === eq.id ? 'selected' : ''}>${esc(eq.nome)}</option>`).join('')}</select></label>
    </div>
    ${lista.length === 0 ? '<div class="historico-vazio"><span>📋</span><h2>Nenhuma avaliação encontrada</h2><p>Quando uma equipe for avaliada, o registro aparecerá aqui.</p></div>' : secoes}
  </div>`;

  el.onchange = (e) => {
    if (e.target.matches('[data-f-dia]')) { st.dia = e.target.value; st.equipe = 'todas'; }
    if (e.target.matches('[data-f-equipe]')) st.equipe = e.target.value;
    ctx.atualizar();
  };
}

/* ================================================================
   PERFIL
   ================================================================ */
const PAPEL_LABEL = { PARTICIPANTE: 'Participante', MONITOR: 'Monitor', ADMIN: 'Administrador' };

function paginaPerfil(el, ctx) {
  const u = ctx.usuario;
  const st = estado.perfil;
  const rk = u.equipeId ? ranking('geral').find((r) => r.equipeId === u.equipeId) : null;

  el.innerHTML = `
  <div class="dashboard perfil">
    <header><h1>Meu perfil</h1></header>
    <div class="profile-card">
      <div class="profile-avatar cor-${corAvatar(u.nome)}">${esc(iniciais(u.nome))}</div>
      ${st.editando ? `
      <form class="profile-form" data-form-perfil>
        <label>Nome<input name="nome" value="${esc(u.nome)}" required /></label>
        <label>Sobre você<textarea name="bio" rows="3">${esc(u.bio || '')}</textarea></label>
        <div class="profile-form-actions"><button type="submit">Salvar perfil</button><button type="button" class="profile-cancelar" data-cancelar>Cancelar</button></div>
      </form>` : `
      <div class="profile-info">
        <h2>${esc(u.nome)}</h2>
        ${u.email ? `<p class="profile-email">${esc(u.email)}</p>` : ''}
        <p class="profile-email">${PAPEL_LABEL[u.papel] || 'Participante'}</p>
        ${u.bio ? `<p class="profile-bio">${esc(u.bio)}</p>` : '<p class="profile-bio profile-bio-vazia">Sem bio ainda.</p>'}
        <button type="button" class="profile-editar" data-editar>Editar perfil</button>
      </div>`}
    </div>
    <div class="profile-stats">
      <div class="profile-stat"><span class="profile-stat-valor">${esc(u.equipe?.nome || '—')}</span><span class="profile-stat-label">Minha equipe</span></div>
      <div class="profile-stat"><span class="profile-stat-valor">${rk ? pts(rk.pontuacao) : 0}</span><span class="profile-stat-label">Pontos da equipe (geral)</span></div>
      <div class="profile-stat"><span class="profile-stat-valor">${rk ? '#' + rk.posicao : '—'}</span><span class="profile-stat-label">Posição no ranking</span></div>
      <div class="profile-stat"><span class="profile-stat-valor">${rk ? rk.desafiosConcluidos : 0}/${TOTAL_DESAFIOS}</span><span class="profile-stat-label">Desafios concluídos</span></div>
    </div>
  </div>`;

  el.onclick = (e) => {
    if (e.target.closest('[data-editar]')) { st.editando = true; ctx.atualizar(); }
    if (e.target.closest('[data-cancelar]')) { st.editando = false; ctx.atualizar(); }
  };
  el.onsubmit = (e) => {
    e.preventDefault();
    const nome = e.target.elements.nome.value.trim();
    if (!nome) return;
    const p = db().participantes.find((x) => x.id === u.id);
    p.nome = nome; p.bio = e.target.elements.bio.value.trim();
    salvar();
    st.editando = false;
    ctx.atualizarTudo();
  };
}

/* ================================================================
   LOGIN / CADASTRO
   ================================================================ */
function paginaAuth(root, aoAutenticar) {
  let modo = 'login';
  let erro = '';
  let tremer = false;
  let sucesso = false;
  let enviando = false;

  function desenhar() {
    root.innerHTML = `
    <div class="auth-screen">
      <div class="auth-blob auth-blob-1" aria-hidden="true"></div>
      <div class="auth-blob auth-blob-2" aria-hidden="true"></div>
      <div class="auth-blob auth-blob-3" aria-hidden="true"></div>
      <div class="auth-layout">
        <section class="auth-mascot-panel" aria-label="Mascote do Desafio Dahora">
          <div class="mascot-kicker"><span class="mascot-live-dot"></span> DESAFIO INICIADO</div>
          <div class="mascot-stage" aria-hidden="true">
            <div class="mascot-orbit mascot-orbit-a"></div>
            <div class="mascot-orbit mascot-orbit-b"></div>
            <div class="mascot-platform"><span></span></div>
            <div class="mascot-spark mascot-spark-one">✦</div>
            <div class="mascot-spark mascot-spark-two">✧</div>
            <div class="mascot-spark mascot-spark-three">+</div>
            <img class="dh-mascot dh-robot-mascot" src="img/mascote-dahora.svg" alt="Dahora, robô mascote do Desafio Dahora, acenando" />
            <div class="mascot-hud mascot-hud-left"><span>XP</span><strong>+250</strong><i></i></div>
            <div class="mascot-hud mascot-hud-right"><span>MISSÃO</span><strong>EM EQUIPE</strong><i></i></div>
          </div>
          <div class="mascot-copy">
            <p class="mascot-eyebrow">SEU PRÓXIMO NÍVEL COMEÇA AQUI</p>
            <h1>Jogue junto.<br/><span>Vá mais longe.</span></h1>
            <p>Desafios, estratégia e trabalho em equipe. Seu personagem já está pronto — só falta você.</p>
          </div>
        </section>
        <div class="auth-card ${tremer ? 'auth-card-tremer' : ''} ${sucesso ? 'auth-card-sucesso' : ''}">
          <div class="auth-card-glow" aria-hidden="true"></div>
          <div class="auth-logo">
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M3 8.5 12 3l9 5.5v6L12 20l-9-5.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="11.3" r="2.1" fill="currentColor"/></svg>
            <span>Desafio <em>Dahora</em></span>
          </div>
          ${sucesso ? `
          <div class="auth-sucesso">
            <span class="auth-sucesso-check"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M4.5 12.5 9 17l10.5-11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <p>${modo === 'cadastro' ? 'Conta criada! Preparando seu perfil…' : 'Bem-vindo de volta!'}</p>
          </div>` : `
          <div class="auth-tabs">
            <span class="auth-tabs-indicador ${modo === 'cadastro' ? 'auth-tabs-indicador-direita' : ''}"></span>
            <button type="button" class="${modo === 'login' ? 'ativo' : ''}" data-modo="login">Entrar</button>
            <button type="button" class="${modo === 'cadastro' ? 'ativo' : ''}" data-modo="cadastro">Cadastrar</button>
          </div>
          <form class="auth-form" novalidate>
            ${modo === 'cadastro' ? `<label class="auth-campo" style="--atraso:0ms">Nome completo<input name="nome" placeholder="Como você quer aparecer" autofocus /></label>` : ''}
            <label class="auth-campo" style="--atraso:${modo === 'cadastro' ? '60ms' : '0ms'}">E-mail<input name="email" type="email" placeholder="voce@email.com" value="${modo === 'login' ? 'pedro@demo.com' : ''}" /></label>
            <label class="auth-campo" style="--atraso:${modo === 'cadastro' ? '120ms' : '60ms'}">Senha<input name="senha" type="password" placeholder="••••••••" ${modo === 'login' ? 'value="demo"' : ''} /></label>
            ${modo === 'cadastro' ? `
            <label class="auth-campo" style="--atraso:150ms">Eu sou<select name="papel"><option value="PARTICIPANTE">Participante</option><option value="MONITOR">Monitor</option></select></label>
            <label class="auth-campo" style="--atraso:180ms">Confirmar senha<input name="confirmar" type="password" placeholder="••••••••" /></label>` : ''}
            ${erro ? `<p class="auth-erro">${esc(erro)}</p>` : ''}
            <button type="submit" class="auth-submit" ${enviando ? 'disabled' : ''}><span>${enviando ? 'Só um instante…' : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}</span></button>
          </form>
          <p class="auth-troca">${modo === 'login'
            ? 'Ainda não tem conta? <button type="button" data-modo="cadastro">Cadastre-se</button>'
            : 'Já tem conta? <button type="button" data-modo="login">Entrar</button>'}</p>`}
        </div>
      </div>
    </div>`;
  }

  function falha(msg) {
    erro = msg; tremer = true; desenhar();
    setTimeout(() => { tremer = false; const c = root.querySelector('.auth-card'); if (c) c.classList.remove('auth-card-tremer'); }, 420);
  }

  root.onclick = (e) => {
    const b = e.target.closest('[data-modo]');
    if (b && b.dataset.modo !== modo) { modo = b.dataset.modo; erro = ''; desenhar(); }
  };
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = e.target.elements;
    erro = '';
    if (modo === 'cadastro') {
      if (!f.nome.value.trim()) return falha('Digite seu nome.');
      if (!f.email.value.trim()) return falha('Digite seu e-mail.');
      if (f.senha.value.length < 4) return falha('A senha precisa de pelo menos 4 caracteres.');
      if (f.senha.value !== f.confirmar.value) return falha('As senhas não coincidem.');
    } else if (!f.email.value.trim() || !f.senha.value) {
      return falha('Preencha e-mail e senha.');
    }
    try {
      if (modo === 'cadastro') cadastrar({ nome: f.nome.value, email: f.email.value, papel: f.papel.value });
      else entrar(f.email.value);
    } catch (err) { return falha(err.message); }
    enviando = false; sucesso = true; desenhar();
    setTimeout(aoAutenticar, 650);
  };
  desenhar();
}
