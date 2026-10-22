/* ================================================================
   Desafio Dahora — dados e regras (sem backend, sem banco)
   Tudo fica no localStorage do navegador.
   Para restaurar os exemplos: apague a chave CHAVE_DADOS e recarregue.
   ================================================================ */

const CHAVE_DADOS = 'desafio-dahora:demo-vanilla-v1';
const CHAVE_SESSAO = 'desafio-dahora:sessao-vanilla';

/* ---------- constantes ---------- */
const PALETA_CORES = [
  { chave: 'roxo', nome: 'Roxo', hex: '#8b5cf6' },
  { chave: 'azul', nome: 'Azul', hex: '#3b82f6' },
  { chave: 'ciano', nome: 'Ciano', hex: '#22d3ee' },
  { chave: 'rosa', nome: 'Rosa', hex: '#ff5fc0' },
  { chave: 'verde', nome: 'Verde', hex: '#34d399' },
  { chave: 'amarelo', nome: 'Amarelo', hex: '#fbbf24' },
  { chave: 'laranja', nome: 'Laranja', hex: '#fb923c' },
  { chave: 'vermelho', nome: 'Vermelho', hex: '#f87171' },
];
function corPorChave(chave) {
  return PALETA_CORES.find((c) => c.chave === chave) || PALETA_CORES[0];
}

const CRITERIOS = [
  { chave: 'conclusao', label: 'Conclusão', max: 50 },
  { chave: 'criatividade', label: 'Criatividade', max: 20 },
  { chave: 'inovacao', label: 'Inovação', max: 20 },
  { chave: 'apresentacao', label: 'Apresentação', max: 10 },
  { chave: 'conclusaoRapida', label: 'Conclusão em menos tempo', max: 40 },
  { chave: 'usoIA', label: 'Utilização responsável de IA', max: 30 },
];
const PONTUACAO_MAXIMA = CRITERIOS.reduce((s, c) => s + c.max, 0);

const DESAFIO_STATUS_LABELS = {
  BLOQUEADO: 'Bloqueado',
  DISPONIVEL: 'Disponível',
  EM_ANDAMENTO: 'Em andamento',
  EM_AVALIACAO: 'Em avaliação',
  FINALIZADO: 'Finalizado',
};
const DESAFIO_STATUS_ICON = {
  BLOQUEADO: '🔒',
  DISPONIVEL: '🟢',
  EM_ANDAMENTO: '🟡',
  EM_AVALIACAO: '🔵',
  FINALIZADO: '✅',
};
const DIAS = [
  { dia: 1, titulo: 'Dia 1', categoria: 'IA, Criatividade e Soluções Digitais' },
  { dia: 2, titulo: 'Dia 2', categoria: 'Maker, Robótica e IoT' },
  { dia: 3, titulo: 'Dia 3', categoria: 'Dados, Programação e Inovação' },
];
const TIPOS_CARTA = [
  { valor: 'AULA', label: 'Carta Aula', descricao: '+10 min de explicação adicional sobre o desafio.' },
  { valor: 'MENTOR', label: 'Carta Mentor', descricao: 'Consultoria rápida com um mentor.' },
  { valor: 'DICA', label: 'Carta Dica', descricao: 'Uma dica exclusiva para o desafio atual.' },
];
const TOTAL_DESAFIOS = 36;

/* ---------- dados de exemplo ---------- */
function dadosIniciais() {
  const agora = new Date().toISOString();
  return {
    participantes: [
      { id: 'p1', nome: 'Marina Alves', email: 'marina@demo.com', papel: 'ADMIN', bio: 'Administradora da demonstração', equipeId: 'e1' },
      { id: 'p2', nome: 'Pedro Lima', email: 'pedro@demo.com', papel: 'PARTICIPANTE', bio: 'Participante da Equipe Nebulosa', equipeId: 'e1' },
      { id: 'p3', nome: 'Sofia Rocha', email: 'sofia@demo.com', papel: 'PARTICIPANTE', equipeId: 'e1' },
      { id: 'p4', nome: 'Lucas Martins', email: 'lucas@demo.com', papel: 'PARTICIPANTE', equipeId: 'e1' },
      { id: 'p5', nome: 'Ana Costa', email: 'ana@demo.com', papel: 'PARTICIPANTE', equipeId: 'e2' },
      { id: 'p6', nome: 'Rafael Souza', email: 'rafael@demo.com', papel: 'PARTICIPANTE', equipeId: 'e2' },
      { id: 'p7', nome: 'Beatriz Melo', email: 'bia@demo.com', papel: 'PARTICIPANTE', equipeId: 'e2' },
      { id: 'p8', nome: 'Caio Nunes', email: 'caio@demo.com', papel: 'PARTICIPANTE', equipeId: 'e3' },
      { id: 'p9', nome: 'Isabela Freitas', email: 'isa@demo.com', papel: 'PARTICIPANTE', equipeId: 'e3' },
      { id: 'p10', nome: 'João Pedro', email: 'joao@demo.com', papel: 'PARTICIPANTE', equipeId: 'e3' },
      { id: 'p11', nome: 'Camila Reis', email: 'camila@demo.com', papel: 'MONITOR', equipeId: null },
    ],
    equipes: [
      { id: 'e1', nome: 'Equipe Nebulosa', cor: 'roxo', pontuacao: 245 },
      { id: 'e2', nome: 'Equipe Fênix', cor: 'laranja', pontuacao: 220 },
      { id: 'e3', nome: 'Equipe Pixel', cor: 'azul', pontuacao: 185 },
    ],
    desafios: [
      { id: 'd1', numero: 1, dia: 1, titulo: 'Ideia que transforma', categoria: 'Criatividade e IA', descricao: 'Identifique um problema real da comunidade e proponha uma solução digital.', instrucoes: 'Preparem um pitch de 2 minutos e um esboço da solução.', status: 'FINALIZADO' },
      { id: 'd2', numero: 2, dia: 1, titulo: 'Protótipo relâmpago', categoria: 'Soluções digitais', descricao: 'Criem um protótipo navegável que demonstre a ideia da equipe.', instrucoes: 'Mostrem o fluxo principal da solução.', status: 'EM_AVALIACAO' },
      { id: 'd3', numero: 3, dia: 1, titulo: 'Missão colaborativa', categoria: 'Trabalho em equipe', descricao: 'Planejem as tarefas e apresentem uma entrega conjunta.', instrucoes: 'Todos os integrantes devem participar da apresentação.', status: 'EM_ANDAMENTO' },
      { id: 'd4', numero: 1, dia: 2, titulo: 'Robô em ação', categoria: 'Maker e robótica', descricao: 'Desenhem uma solução automatizada para um desafio cotidiano.', instrucoes: 'Incluam sensores, entradas e saídas no desenho.', status: 'DISPONIVEL' },
      { id: 'd5', numero: 2, dia: 2, titulo: 'Cidade conectada', categoria: 'IoT', descricao: 'Criem uma proposta de objeto conectado que melhore a cidade.', instrucoes: 'Descrevam como os dados serão coletados e usados.', status: 'BLOQUEADO' },
      { id: 'd6', numero: 1, dia: 3, titulo: 'Dados contam histórias', categoria: 'Dados e programação', descricao: 'Transformem um conjunto de dados em uma descoberta visual.', instrucoes: 'Apresentem a conclusão e como chegaram a ela.', status: 'BLOQUEADO' },
    ],
    avaliacoes: [
      { id: 'a1', equipeId: 'e1', desafioId: 'd1', pontuacaoTotal: 88, conclusao: 40, criatividade: 17, inovacao: 16, apresentacao: 8, conclusaoRapida: 0, usoIA: 7, feedback: 'Excelente proposta e ótima divisão de tarefas. Para a próxima etapa, detalhem melhor como validar a solução com usuários.', createdAt: agora, updatedAt: agora },
      { id: 'a2', equipeId: 'e2', desafioId: 'd1', pontuacaoTotal: 81, conclusao: 38, criatividade: 16, inovacao: 15, apresentacao: 8, conclusaoRapida: 0, usoIA: 4, feedback: 'Boa ideia, com potencial de impacto. Expliquem melhor o público-alvo e priorizem as funcionalidades.', createdAt: agora, updatedAt: agora },
      { id: 'a3', equipeId: 'e3', desafioId: 'd1', pontuacaoTotal: 74, conclusao: 35, criatividade: 15, inovacao: 14, apresentacao: 7, conclusaoRapida: 0, usoIA: 3, feedback: 'Boa colaboração. A apresentação pode ficar mais clara com um exemplo de uso.', createdAt: agora, updatedAt: agora },
    ],
    colunas: [
      { id: 'c1', equipeId: 'e1', nome: 'A fazer', cartoes: [
        { id: 't1', titulo: 'Pesquisar referências', descricao: 'Buscar soluções parecidas e anotar aprendizados.', cor: 'azul' },
        { id: 't2', titulo: 'Definir identidade visual', descricao: 'Escolher cores e tipografia do protótipo.', cor: 'roxo' } ] },
      { id: 'c2', equipeId: 'e1', nome: 'Em andamento', cartoes: [
        { id: 't3', titulo: 'Montar protótipo', descricao: 'Criar telas principais e fluxo de navegação.', cor: 'laranja' } ] },
      { id: 'c3', equipeId: 'e1', nome: 'Em revisão', cartoes: [
        { id: 't4', titulo: 'Preparar pitch', descricao: 'Ensaiar apresentação de dois minutos.', cor: 'verde' } ] },
      { id: 'c4', equipeId: 'e1', nome: 'Concluído', cartoes: [
        { id: 't5', titulo: 'Escolher problema', descricao: 'Problema definido pela equipe.', cor: 'verde' } ] },
      { id: 'c5', equipeId: 'e2', nome: 'A fazer', cartoes: [
        { id: 't6', titulo: 'Desenhar circuito', descricao: 'Esboço inicial do circuito do projeto.', cor: 'azul' } ] },
      { id: 'c6', equipeId: 'e2', nome: 'Em andamento', cartoes: [] },
      { id: 'c7', equipeId: 'e2', nome: 'Concluído', cartoes: [
        { id: 't7', titulo: 'Distribuir funções', descricao: 'Papéis definidos entre os integrantes.', cor: 'verde' } ] },
      { id: 'c8', equipeId: 'e3', nome: 'A fazer', cartoes: [] },
      { id: 'c9', equipeId: 'e3', nome: 'Em andamento', cartoes: [] },
      { id: 'c10', equipeId: 'e3', nome: 'Concluído', cartoes: [] },
    ],
    cartas: [
      { id: 'ca1', equipeId: 'e1', desafioId: 'd3', tipo: 'MENTOR', responsavel: 'Marina Alves', horario: agora, tempoUtilizado: 10 },
      { id: 'ca2', equipeId: 'e2', desafioId: 'd4', tipo: 'DICA', responsavel: 'Ana Costa', horario: agora, tempoUtilizado: 10 },
    ],
    desbloqueadas: ['MENTOR', 'DICA', 'AULA'],
  };
}

/* ---------- armazenamento ---------- */
let _db = null;
function db() {
  if (_db) return _db;
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_DADOS));
    if (salvo && salvo.equipes) { _db = salvo; return _db; }
  } catch (e) { /* localStorage indisponível: segue só em memória */ }
  _db = dadosIniciais();
  salvar();
  return _db;
}
function salvar() {
  try { localStorage.setItem(CHAVE_DADOS, JSON.stringify(_db)); } catch (e) { /* ignora */ }
}
function novoId(prefixo) {
  return prefixo + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

/* ---------- sessão ---------- */
function usuarioAtual() {
  let id = null;
  try { id = JSON.parse(localStorage.getItem(CHAVE_SESSAO)); } catch (e) { /* ignora */ }
  const p = id && db().participantes.find((x) => x.id === id);
  if (!p) return null;
  return { ...p, equipe: p.equipeId ? db().equipes.find((e) => e.id === p.equipeId) || null : null };
}
function definirSessao(participanteId) {
  try {
    if (participanteId) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(participanteId));
    else localStorage.removeItem(CHAVE_SESSAO);
  } catch (e) { /* ignora */ }
}
function entrar(email) {
  const d = db();
  let p = d.participantes.find((x) => (x.email || '').toLowerCase() === email.trim().toLowerCase());
  if (!p) {
    p = { id: novoId('p'), nome: 'Visitante da demonstração', email: email.trim(), papel: 'PARTICIPANTE', equipeId: 'e1' };
    d.participantes.push(p);
    salvar();
  }
  definirSessao(p.id);
  return p;
}
function cadastrar({ nome, email, papel }) {
  const d = db();
  if (d.participantes.some((x) => (x.email || '').toLowerCase() === email.trim().toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado. Use a aba "Entrar".');
  }
  const p = { id: novoId('p'), nome: nome.trim(), email: email.trim(), papel: papel || 'PARTICIPANTE', equipeId: 'e1' };
  d.participantes.push(p);
  salvar();
  definirSessao(p.id);
  return p;
}

/* ---------- consultas ---------- */
function equipesComMembros() {
  const d = db();
  return d.equipes.map((e) => ({ ...e, participantes: d.participantes.filter((p) => p.equipeId === e.id) }));
}
function desafioPorId(id) { return db().desafios.find((x) => x.id === id) || null; }
function equipePorId(id) { return db().equipes.find((x) => x.id === id) || null; }

// nivel: 'geral' | 'diario' | 'rodada'
function ranking(nivel, filtro) {
  const d = db();
  let ids = null;
  if (nivel === 'rodada') ids = [filtro];
  if (nivel === 'diario') ids = d.desafios.filter((x) => Number(x.dia) === Number(filtro)).map((x) => x.id);
  return d.equipes
    .map((e) => {
      const aval = d.avaliacoes.filter((a) => a.equipeId === e.id && (!ids || ids.includes(a.desafioId)));
      const soma = aval.reduce((s, a) => s + Number(a.pontuacaoTotal || 0), 0);
      return {
        equipeId: e.id, nome: e.nome, cor: e.cor,
        pontuacao: soma + (nivel === 'geral' ? Number(e.pontuacao || 0) : 0),
        desafiosConcluidos: d.avaliacoes.filter((a) => a.equipeId === e.id).length,
      };
    })
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .map((x, i) => ({ ...x, posicao: i + 1 }));
}

/* ---------- quadro (estilo Trello) ---------- */
function colunasDaEquipe(equipeId) { return db().colunas.filter((c) => c.equipeId === equipeId); }
function achaCartao(cartaoId) {
  for (const col of db().colunas) {
    const idx = col.cartoes.findIndex((t) => t.id === cartaoId);
    if (idx >= 0) return { coluna: col, indice: idx, cartao: col.cartoes[idx] };
  }
  return null;
}
function criarCartao(colunaId, { titulo, descricao, cor }) {
  const col = db().colunas.find((c) => c.id === colunaId);
  if (!col) return;
  col.cartoes.push({ id: novoId('t'), titulo, descricao, cor: cor || null });
  salvar();
}
function editarCartao(cartaoId, campos) {
  const f = achaCartao(cartaoId);
  if (f) { Object.assign(f.cartao, campos); salvar(); }
}
function excluirCartao(cartaoId) {
  const f = achaCartao(cartaoId);
  if (f) { f.coluna.cartoes.splice(f.indice, 1); salvar(); }
}
function moverCartao(cartaoId, colunaId, posicao) {
  const f = achaCartao(cartaoId);
  const destino = db().colunas.find((c) => c.id === colunaId);
  if (!f || !destino) return;
  f.coluna.cartoes.splice(f.indice, 1);
  let pos = Number.isInteger(posicao) ? posicao : destino.cartoes.length;
  if (destino === f.coluna && pos > f.indice) pos -= 1;
  pos = Math.max(0, Math.min(pos, destino.cartoes.length));
  destino.cartoes.splice(pos, 0, f.cartao);
  salvar();
}

/* ---------- cartas de poder ---------- */
function diaRecife(valor) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(valor ? new Date(valor) : new Date());
  const v = Object.fromEntries(partes.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}
function desbloquearCarta(codigo) {
  const tipo = ({ AULA: 'AULA', MENTOR: 'MENTOR', DICA: 'DICA' })[(codigo || '').trim().toUpperCase()];
  if (!tipo) throw new Error('Código de demonstração inválido. Use AULA, MENTOR ou DICA.');
  const d = db();
  if (!d.desbloqueadas.includes(tipo)) d.desbloqueadas.push(tipo);
  salvar();
  return tipo;
}
function usarCarta({ equipeId, desafioId, tipo, responsavel }) {
  const d = db();
  d.cartas.push({ id: novoId('ca'), equipeId, desafioId, tipo, responsavel, horario: new Date().toISOString(), tempoUtilizado: 10 });
  salvar();
}
