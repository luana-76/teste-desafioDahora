/* ================================================================
   Desafio Dahora — aplicação (rotas por hash, menu, topo e rodapé)
   ================================================================ */

const ROTAS = {
  '#/equipes': paginaEquipes,
  '#/desafios': paginaDesafios,
  '#/cartas': paginaCartas,
  '#/quadro': paginaQuadro,
  '#/ranking': paginaRanking,
  '#/avaliacoes': paginaAvaliacoes,
  '#/perfil': paginaPerfil,
};

const NAV_LINKS = [
  { href: '#topo', label: 'Painel' },
  { href: '#/equipes', label: 'Equipes' },
  { href: '#/desafios', label: 'Desafios' },
  { href: '#/cartas', label: 'Cartas' },
  { href: '#/quadro', label: 'Quadro' },
  { href: '#/ranking', label: 'Ranking' },
  { href: '#/avaliacoes', label: 'Avaliações' },
  { href: '#/perfil', label: 'Perfil' },
];

const raiz = document.getElementById('root');
let paginaAtual = null; // função da página mostrada agora

function rotaDoHash() {
  const h = window.location.hash || '';
  const chave = Object.keys(ROTAS).find((k) => h.startsWith(k));
  return chave || '#topo';
}

/* ---------- topo: cronômetro, pontos, avatar ---------- */
function topoHTML(u) {
  let pontos = '';
  if (u.papel !== 'ADMIN') {
    if (!u.equipeId) {
      pontos = `<span class="pontos-chip pontos-vazio" title="Entre em uma equipe pra começar a ganhar pontos"><span class="pontos-icon" aria-hidden="true">🏆</span><span class="pontos-label">Sem equipe</span></span>`;
    } else {
      const rk = ranking('geral').find((r) => r.equipeId === u.equipeId);
      pontos = `<a href="#/ranking" class="pontos-chip" title="Ver ranking completo"><span class="pontos-icon" aria-hidden="true">🏆</span><span class="pontos-valor">${rk ? pts(rk.pontuacao) : '—'}<span class="pontos-unidade">pts</span></span>${rk ? `<span class="pontos-posicao">${rk.posicao}º</span>` : ''}</a>`;
    }
  }
  return `
  <div class="topbar">
    <div class="countdown-wrap">
      <div class="countdown-chip" role="timer" aria-live="polite">
        <span class="countdown-icon" aria-hidden="true">⏱️</span>
        <span class="countdown-label">00:00</span>
        <span class="countdown-time countdown-time-preview">60:00</span>
      </div>
    </div>
    ${pontos}
    <a href="#/perfil" class="avatar" title="Meu perfil" aria-label="Ir para meu perfil">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="8.5" r="3.4" fill="currentColor"/><path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </a>
  </div>`;
}

function rodapeHTML() {
  return `
  <section class="cta">
    <h2>36 desafios, 3 dias, uma equipe vencedora</h2>
    <a class="btn btn-primary" href="#/ranking">Ver ranking</a>
  </section>
  <footer class="footer">
    <div class="footer-brand">
      <span class="navbar-logo">Desafio <em>Dahora</em></span>
      <p>Sistema de acompanhamento da oficina REC'n'PLAY — desafios, equipes, ranking e cronômetro em tempo real.</p>
    </div>
    <div class="footer-col"><h3>Competição</h3><a href="#/desafios">Desafios</a><a href="#/equipes">Equipes</a><a href="#/ranking">Ranking</a></div>
    <div class="footer-col"><h3>Conta</h3><a href="#/perfil">Meu perfil</a></div>
  </footer>`;
}

/* ---------- desenho ---------- */
function desenharPagina() {
  const u = usuarioAtual();
  if (!u) return desenharEntrada();
  const el = document.getElementById('pagina');
  if (!el || !paginaAtual) return desenharTudo();
  paginaAtual(el, contexto(u));
}

function contexto(u) {
  return {
    usuario: u,
    atualizar: desenharPagina,
    atualizarTudo: () => desenharTudo(false),
  };
}

function desenharTudo(rolarAoTopo = true) {
  const u = usuarioAtual();
  if (!u) return desenharEntrada();

  const rota = rotaDoHash();
  paginaAtual = ROTAS[rota] || paginaPainel;

  raiz.innerHTML = `
  <div class="app-shell">
    <div class="navbar">
      <a class="navbar-logo" href="#topo">Desafio <em>Dahora</em></a>
      <nav class="navbar-nav">
        ${NAV_LINKS.map((l) => `<a href="${l.href}" class="${l.href === rota ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>
      <button type="button" class="btn btn-primary navbar-sair" id="btn-sair">Sair</button>
    </div>
    <div class="demo-banner">MODO DEMONSTRAÇÃO · dados fictícios salvos apenas neste navegador · nenhuma conexão com banco de dados</div>
    <div class="main">
      ${topoHTML(u)}
      <div id="pagina"></div>
      ${rodapeHTML()}
    </div>
  </div>`;

  document.getElementById('btn-sair').onclick = () => {
    definirSessao(null);
    window.location.hash = '#/entrar';
    desenharEntrada();
  };

  paginaAtual(document.getElementById('pagina'), contexto(u));
  if (rolarAoTopo) window.scrollTo(0, 0);
}

function desenharEntrada() {
  paginaAtual = null;
  paginaAuth(raiz, () => {
    window.location.hash = '#/perfil';
    desenharTudo();
  });
}

/* ---------- início ---------- */
function iniciar() {
  // Demonstração: se ainda não há sessão, entra direto como participante (Pedro Lima, Equipe Nebulosa).
  if (!usuarioAtual()) definirSessao('p2');
  if (window.location.hash.startsWith('#/entrar')) {
    if (usuarioAtual()) window.location.hash = '#topo';
  }
  desenharTudo();
}

window.addEventListener('hashchange', () => {
  if (window.location.hash.startsWith('#/entrar')) return desenharEntrada();
  if (!usuarioAtual()) return desenharEntrada();
  desenharTudo();
});

iniciar();
