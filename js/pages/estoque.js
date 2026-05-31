import Swal from 'sweetalert2';
import { supabase } from '../supabase.js';

const PAGE_SIZE = 10;
let paginaAtual = 1;
let totalRegistros = 0;
let buscaAtual = '';
let produtosAtivos = [];

const tabela = document.querySelector('#tabela-estoque');
const buscaInput = document.querySelector('#busca-estoque');
const infoPaginacao = document.querySelector('#info-paginacao-estoque');
const btnAnterior = document.querySelector('#pagina-anterior-estoque');
const btnProxima = document.querySelector('#proxima-pagina-estoque');
const formEntrada = document.querySelector('#form-entrada');
const formSaida = document.querySelector('#form-saida');
const estoqueProdutosAtivosEl = document.querySelector('#estoque-produtos-ativos');
const estoqueProdutosBaixoEl = document.querySelector('#estoque-produtos-baixo');
const estoqueEntradasHojeEl = document.querySelector('#estoque-entradas-hoje');
const estoqueSaidasHojeEl = document.querySelector('#estoque-saidas-hoje');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function situacaoProduto(produto) {
  if (!produto.ativo) return '<span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Inativo</span>';
  if (produto.estoque_atual <= produto.estoque_minimo) {
    return '<span class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Abaixo do mínimo</span>';
  }
  return '<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Normal</span>';
}

function renderizarTabela(produtos) {
  if (!produtos.length) {
    tabela.innerHTML = '<tr><td colspan="6" class="border-t border-slate-200 text-center text-slate-500">Nenhum produto encontrado.</td></tr>';
    return;
  }

  tabela.innerHTML = produtos.map((produto) => `
    <tr>
      <td class="border-t border-slate-200 font-medium">${escapeHtml(produto.codigo)}</td>
      <td class="border-t border-slate-200">${escapeHtml(produto.nome)}</td>
      <td class="border-t border-slate-200">${escapeHtml(produto.categorias?.nome || '-')}</td>
      <td class="border-t border-slate-200 font-semibold">${produto.estoque_atual}</td>
      <td class="border-t border-slate-200">${produto.estoque_minimo}</td>
      <td class="border-t border-slate-200">${situacaoProduto(produto)}</td>
    </tr>
  `).join('');
}

function atualizarPaginacao() {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));
  infoPaginacao.textContent = `Página ${paginaAtual} de ${totalPaginas} • ${totalRegistros} registro(s)`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

function preencherSelects() {
  const options = ['<option value="">Selecione um produto ativo</option>']
    .concat(produtosAtivos.map((produto) => `<option value="${produto.id}">${escapeHtml(produto.codigo)} - ${escapeHtml(produto.nome)} (${produto.estoque_atual} un.)</option>`))
    .join('');

  document.querySelectorAll('select[name="produto_id"]').forEach((select) => {
    const valorAtual = select.value;
    select.innerHTML = options;
    select.value = valorAtual;
  });
}

async function carregarProdutosAtivos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('id,codigo,nome,estoque_atual,estoque_minimo,ativo')
    .order('nome', { ascending: true });

  if (error) throw error;
  produtosAtivos = (data ?? []).filter((produto) => produto.ativo);
  preencherSelects();
}

async function carregarResumoEstoque() {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioDia = hoje.toISOString();
    const fimDia = new Date(hoje.getTime() + 86399999).toISOString();

    const [{ count: ativos }, produtosRes, { count: entradas }, { count: saidas }] = await Promise.all([
      supabase.from('produtos').select('id', { count: 'exact' }).eq('ativo', true),
      // Buscar dados para calcular localmente produtos com estoque abaixo do mínimo
      supabase.from('produtos').select('estoque_atual,estoque_minimo,ativo'),
      supabase.from('movimentacoes_estoque').select('id', { count: 'exact' }).eq('tipo_movimentacao', 'entrada').gte('data_movimentacao', inicioDia).lte('data_movimentacao', fimDia),
      supabase.from('movimentacoes_estoque').select('id', { count: 'exact' }).eq('tipo_movimentacao', 'saida').gte('data_movimentacao', inicioDia).lte('data_movimentacao', fimDia)
    ]);

    estoqueProdutosAtivosEl.textContent = String(ativos ?? 0);

    const produtosList = produtosRes.data ?? [];
    const countBaixo = produtosList.reduce((acc, p) => {
      const ativo = p.ativo === true || String(p.ativo) === 'true';
      const atual = Number(p.estoque_atual) || 0;
      const minimo = Number(p.estoque_minimo) || 0;
      return acc + (ativo && atual < minimo ? 1 : 0);
    }, 0);

    estoqueProdutosBaixoEl.textContent = String(countBaixo);
    estoqueEntradasHojeEl.textContent = String(entradas ?? 0);
    estoqueSaidasHojeEl.textContent = String(saidas ?? 0);
  } catch (error) {
    console.error('Falha ao carregar resumo do estoque:', error.message);
  }
}

async function carregarEstoque() {
  try {
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const fim = inicio + PAGE_SIZE - 1;
    let query = supabase
      .from('produtos')
      .select('id,codigo,nome,estoque_atual,estoque_minimo,ativo,categorias(nome)', { count: 'exact' })
      .order('nome', { ascending: true })
      .range(inicio, fim);

    if (buscaAtual) {
      query = query.or(`nome.ilike.%${buscaAtual}%,codigo.ilike.%${buscaAtual}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    totalRegistros = count ?? 0;
    renderizarTabela(data ?? []);
    atualizarPaginacao();
    await carregarResumoEstoque();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao carregar estoque', text: error.message });
  }
}

async function buscarProdutoAtivo(id) {
  const { data, error } = await supabase
    .from('produtos')
    .select('id,nome,codigo,estoque_atual,ativo')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function registrarMovimentacao(tipo, form) {
  const formData = new FormData(form);
  const produtoId = String(formData.get('produto_id') || '').trim();
  const quantidade = Number.parseInt(formData.get('quantidade'), 10);
  const observacao = String(formData.get('observacao') || '').trim();

  if (!produtoId || !Number.isInteger(quantidade) || quantidade <= 0) {
    await Swal.fire({ icon: 'warning', title: 'Dados incompletos', text: 'Selecione um produto e informe uma quantidade maior que zero.' });
    return;
  }

  try {
    const { data: sessao, error: erroSessao } = await supabase.auth.getSession();
    if (erroSessao) throw erroSessao;

    const usuarioId = sessao?.session?.user?.id;
    if (!usuarioId) {
      await Swal.fire({ icon: 'warning', title: 'Sessão expirada', text: 'Faça login novamente para registrar movimentações.' });
      return;
    }

    const produto = await buscarProdutoAtivo(produtoId);
    if (!produto.ativo) {
      await Swal.fire({ icon: 'warning', title: 'Produto inativo', text: 'Não é permitido movimentar produtos inativos.' });
      return;
    }

    const novoEstoque = tipo === 'entrada'
      ? produto.estoque_atual + quantidade
      : produto.estoque_atual - quantidade;

    if (novoEstoque < 0) {
      await Swal.fire({ icon: 'warning', title: 'Estoque insuficiente', text: `O produto possui apenas ${produto.estoque_atual} unidade(s) em estoque.` });
      return;
    }

    const confirmacao = await Swal.fire({
      icon: 'question',
      title: tipo === 'entrada' ? 'Confirmar entrada?' : 'Confirmar saída?',
      text: `${produto.codigo} - ${produto.nome}: ${quantidade} unidade(s). Novo estoque: ${novoEstoque}.`,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacao.isConfirmed) return;

    const { error: erroMovimentacao } = await supabase.from('movimentacoes_estoque').insert({
      produto_id: produto.id,
      tipo_movimentacao: tipo,
      quantidade,
      observacao: observacao || null,
      usuario_id: usuarioId
    });

    if (erroMovimentacao) throw erroMovimentacao;

    const { error: erroEstoque } = await supabase
      .from('produtos')
      .update({ estoque_atual: novoEstoque })
      .eq('id', produto.id);

    if (erroEstoque) throw erroEstoque;

    form.reset();
    await Swal.fire({ icon: 'success', title: 'Movimentação registrada', text: 'O estoque do produto foi atualizado.' });
    await carregarProdutosAtivos();
    await carregarEstoque();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao registrar movimentação', text: error.message });
  }
}

function configurarEventos() {
  formEntrada?.addEventListener('submit', (event) => {
    event.preventDefault();
    registrarMovimentacao('entrada', formEntrada);
  });

  formSaida?.addEventListener('submit', (event) => {
    event.preventDefault();
    registrarMovimentacao('saida', formSaida);
  });

  buscaInput?.addEventListener('input', () => {
    buscaAtual = buscaInput.value.trim();
    paginaAtual = 1;
    carregarEstoque();
  });

  btnAnterior?.addEventListener('click', () => {
    if (paginaAtual > 1) {
      paginaAtual -= 1;
      carregarEstoque();
    }
  });

  btnProxima?.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(totalRegistros / PAGE_SIZE)) {
      paginaAtual += 1;
      carregarEstoque();
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  configurarEventos();
  try {
    await carregarProdutosAtivos();
    await carregarEstoque();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao iniciar estoque', text: error.message });
  }
});
