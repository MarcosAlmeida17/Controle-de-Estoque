import Swal from 'sweetalert2';
import { supabase } from '../supabase.js';

const PAGE_SIZE = 10;
let paginaAtual = 1;
let totalRegistros = 0;
let buscaAtual = '';
let statusAtual = 'todos';
let categoriasAtivas = [];
let fornecedoresAtivos = [];

const tabela = document.querySelector('#tabela-produtos');
const buscaInput = document.querySelector('#busca-produtos');
const statusSelect = document.querySelector('#filtro-status-produtos');
const infoPaginacao = document.querySelector('#info-paginacao-produtos');
const btnAnterior = document.querySelector('#pagina-anterior-produtos');
const btnProxima = document.querySelector('#proxima-pagina-produtos');
const btnNovo = document.querySelector('#btn-novo-produto');
const totalProdutosEl = document.querySelector('#total-produtos');
const produtosAtivosEl = document.querySelector('#produtos-ativos');
const produtosInativosEl = document.querySelector('#produtos-inativos');
const produtosEstoqueBaixoEl = document.querySelector('#produtos-estoque-baixo');

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function numero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatarStatus(ativo) {
  const classes = ativo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700';
  const texto = ativo ? 'Ativo' : 'Inativo';
  return `<span class="rounded-full px-3 py-1 text-xs font-semibold ${classes}">${texto}</span>`;
}

function montarLinha(produto) {
  const estoqueBaixo = produto.estoque_atual <= produto.estoque_minimo;
  const acaoStatus = produto.ativo ? 'Inativar' : 'Reativar';
  return `
    <tr>
      <td class="border-t border-slate-200 font-medium">${escapeHtml(produto.codigo)}</td>
      <td class="border-t border-slate-200">${escapeHtml(produto.nome)}</td>
      <td class="border-t border-slate-200">${escapeHtml(produto.categorias?.nome || '-')}</td>
      <td class="border-t border-slate-200">${escapeHtml(produto.fornecedores?.nome || '-')}</td>
      <td class="border-t border-slate-200 ${estoqueBaixo ? 'font-semibold text-red-600' : ''}">${produto.estoque_atual}</td>
      <td class="border-t border-slate-200">${moeda.format(numero(produto.preco_venda))}</td>
      <td class="border-t border-slate-200">${formatarStatus(produto.ativo)}</td>
      <td class="border-t border-slate-200">
        <div class="flex flex-wrap gap-2">
          <button class="btn-secondary" data-editar-produto="${produto.id}">Editar</button>
          <button class="btn-secondary" data-alternar-produto="${produto.id}" data-ativo="${produto.ativo}">${acaoStatus}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderizarTabela(produtos) {
  if (!produtos.length) {
    tabela.innerHTML = '<tr><td colspan="8" class="border-t border-slate-200 text-center text-slate-500">Nenhum produto encontrado.</td></tr>';
    return;
  }

  tabela.innerHTML = produtos.map(montarLinha).join('');
}

function atualizarPaginacao() {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));
  infoPaginacao.textContent = `Página ${paginaAtual} de ${totalPaginas} • ${totalRegistros} registro(s)`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

async function carregarResumoProdutos() {
  try {
    const [{ count: total }, { count: ativos }, { count: inativos }, produtosRes] = await Promise.all([
      supabase.from('produtos').select('id', { count: 'exact' }),
      supabase.from('produtos').select('id', { count: 'exact' }).eq('ativo', true),
      supabase.from('produtos').select('id', { count: 'exact' }).eq('ativo', false),
      // Buscar dados para calcular localmente produtos com estoque abaixo do mínimo
      supabase.from('produtos').select('estoque_atual,estoque_minimo,ativo')
    ]);

    totalProdutosEl.textContent = String(total ?? 0);
    produtosAtivosEl.textContent = String(ativos ?? 0);
    produtosInativosEl.textContent = String(inativos ?? 0);

    const produtosList = produtosRes.data ?? [];
    const countEstoqueBaixo = produtosList.reduce((acc, p) => {
      const ativo = p.ativo === true || String(p.ativo) === 'true';
      const atual = Number(p.estoque_atual) || 0;
      const minimo = Number(p.estoque_minimo) || 0;
      return acc + (ativo && atual < minimo ? 1 : 0);
    }, 0);

    produtosEstoqueBaixoEl.textContent = String(countEstoqueBaixo);
  } catch (error) {
    console.error('Falha ao carregar resumo de produtos:', error.message);
  }
}

async function carregarProdutos() {
  try {
    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const fim = inicio + PAGE_SIZE - 1;
    let query = supabase
      .from('produtos')
      .select('id,codigo,nome,descricao,preco_custo,preco_venda,estoque_atual,estoque_minimo,ativo,categorias(nome),fornecedores(nome)', { count: 'exact' })
      .order('nome', { ascending: true })
      .range(inicio, fim);

    if (buscaAtual) {
      query = query.or(`nome.ilike.%${buscaAtual}%,codigo.ilike.%${buscaAtual}%`);
    }

    if (statusAtual === 'ativos') query = query.eq('ativo', true);
    if (statusAtual === 'inativos') query = query.eq('ativo', false);

    const { data, error, count } = await query;
    if (error) throw error;

    totalRegistros = count ?? 0;
    renderizarTabela(data ?? []);
    atualizarPaginacao();
    await carregarResumoProdutos();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao carregar produtos', text: error.message });
  }
}

async function buscarProduto(id) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*,categorias(nome),fornecedores(nome)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

function campo(id, label, type, value = '', attrs = '') {
  return `
    <label class="block text-left text-sm font-medium text-slate-600">
      ${label}
      <input id="${id}" type="${type}" value="${escapeHtml(value)}" ${attrs} class="mt-2 w-full" />
    </label>
  `;
}

function campoSelect(id, label, items, selectedValue = '', required = false) {
  const options = items
    .map((item) => `
      <option value="${item.id}"${item.id === selectedValue ? ' selected' : ''}>${escapeHtml(item.nome)}</option>`)
    .join('');

  return `
    <label class="block text-left text-sm font-medium text-slate-600">
      ${label}
      <select id="${id}" class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900" ${required ? 'required' : ''}>
        <option value="">Selecione...</option>
        ${options}
      </select>
    </label>
  `;
}

async function carregarCategoriasAtivas() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id,nome')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) throw error;
  categoriasAtivas = data ?? [];
}

async function carregarFornecedoresAtivos() {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('id,nome')
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) throw error;
  fornecedoresAtivos = data ?? [];
}

async function carregarCategoriasEFornecedores() {
  await Promise.all([carregarCategoriasAtivas(), carregarFornecedoresAtivos()]);
}

async function abrirFormularioProduto(produto = null) {
  const isEdicao = Boolean(produto);
  if (!categoriasAtivas.length || !fornecedoresAtivos.length) {
    await carregarCategoriasEFornecedores();
  }

  const categoriaSelecionada = produto?.categoria_id || '';
  const fornecedorSelecionado = produto?.fornecedor_id || '';

  const html = `
    <div class="grid gap-3 md:grid-cols-2">
      ${campo('swal-codigo', 'Código', 'text', produto?.codigo, 'required')}
      ${campo('swal-nome', 'Nome', 'text', produto?.nome, 'required')}
      ${campoSelect('swal-categoria', 'Categoria', categoriasAtivas, categoriaSelecionada, true)}
      ${campoSelect('swal-fornecedor', 'Fornecedor', fornecedoresAtivos, fornecedorSelecionado)}
      ${campo('swal-preco-custo', 'Preço de custo', 'number', produto?.preco_custo ?? 0, 'min="0" step="0.01"')}
      ${campo('swal-preco-venda', 'Preço de venda', 'number', produto?.preco_venda ?? 0, 'min="0" step="0.01"')}
      ${campo('swal-estoque-atual', 'Estoque atual', 'number', produto?.estoque_atual ?? 0, 'min="0" step="1"')}
      ${campo('swal-estoque-minimo', 'Estoque mínimo', 'number', produto?.estoque_minimo ?? 0, 'min="0" step="1"')}
    </div>
    <label class="mt-3 block text-left text-sm font-medium text-slate-600">
      Descrição
      <textarea id="swal-descricao" rows="3" class="mt-2 w-full">${escapeHtml(produto?.descricao || '')}</textarea>
    </label>
  `;

  const resultado = await Swal.fire({
    title: isEdicao ? 'Editar produto' : 'Novo produto',
    html,
    width: 760,
    showCancelButton: true,
    confirmButtonText: isEdicao ? 'Salvar alterações' : 'Cadastrar produto',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    preConfirm: () => {
      const dados = {
        codigo: document.querySelector('#swal-codigo').value.trim(),
        nome: document.querySelector('#swal-nome').value.trim(),
        categoria_id: document.querySelector('#swal-categoria').value,
        fornecedor_id: document.querySelector('#swal-fornecedor').value || null,
        preco_custo: numero(document.querySelector('#swal-preco-custo').value),
        preco_venda: numero(document.querySelector('#swal-preco-venda').value),
        estoque_atual: Number.parseInt(document.querySelector('#swal-estoque-atual').value, 10),
        estoque_minimo: Number.parseInt(document.querySelector('#swal-estoque-minimo').value, 10),
        descricao: document.querySelector('#swal-descricao').value.trim()
      };

      if (!dados.codigo || !dados.nome || !dados.categoria_id) {
        Swal.showValidationMessage('Informe código, nome e categoria.');
        return false;
      }

      if (dados.estoque_atual < 0 || dados.estoque_minimo < 0) {
        Swal.showValidationMessage('Estoque atual e mínimo não podem ser negativos.');
        return false;
      }

      return dados;
    }
  });

  if (!resultado.isConfirmed) return;

  try {
    const dados = resultado.value;
    const payload = {
      codigo: dados.codigo,
      nome: dados.nome,
      descricao: dados.descricao || null,
      categoria_id: dados.categoria_id,
      fornecedor_id: dados.fornecedor_id,
      preco_custo: dados.preco_custo,
      preco_venda: dados.preco_venda,
      estoque_atual: dados.estoque_atual,
      estoque_minimo: dados.estoque_minimo
    };

    const query = isEdicao
      ? supabase.from('produtos').update(payload).eq('id', produto.id)
      : supabase.from('produtos').insert(payload);

    const { error } = await query;
    if (error) throw error;

    await Swal.fire({ icon: 'success', title: 'Produto salvo', text: 'O cadastro foi atualizado com sucesso.' });
    await carregarProdutos();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao salvar produto', text: error.message });
  }
}

async function alternarStatusProduto(id, ativoAtual) {
  const novoStatus = !ativoAtual;
  const acao = novoStatus ? 'reativar' : 'inativar';
  const confirmacao = await Swal.fire({
    icon: 'question',
    title: `${acao.charAt(0).toUpperCase() + acao.slice(1)} produto?`,
    text: novoStatus ? 'O produto voltará a aceitar movimentações.' : 'Produtos inativos não podem receber movimentações.',
    showCancelButton: true,
    confirmButtonText: novoStatus ? 'Reativar' : 'Inativar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const { error } = await supabase.from('produtos').update({ ativo: novoStatus }).eq('id', id);
    if (error) throw error;

    await Swal.fire({ icon: 'success', title: 'Status atualizado', text: 'O produto foi atualizado com sucesso.' });
    await carregarProdutos();
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao atualizar status', text: error.message });
  }
}

function configurarEventos() {
  btnNovo?.addEventListener('click', () => abrirFormularioProduto());

  buscaInput?.addEventListener('input', () => {
    buscaAtual = buscaInput.value.trim();
    paginaAtual = 1;
    carregarProdutos();
  });

  statusSelect?.addEventListener('change', () => {
    statusAtual = statusSelect.value;
    paginaAtual = 1;
    carregarProdutos();
  });

  btnAnterior?.addEventListener('click', () => {
    if (paginaAtual > 1) {
      paginaAtual -= 1;
      carregarProdutos();
    }
  });

  btnProxima?.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(totalRegistros / PAGE_SIZE)) {
      paginaAtual += 1;
      carregarProdutos();
    }
  });

  tabela?.addEventListener('click', async (event) => {
    const editar = event.target.closest('[data-editar-produto]');
    const alternar = event.target.closest('[data-alternar-produto]');

    if (editar) {
      try {
        const produto = await buscarProduto(editar.dataset.editarProduto);
        await abrirFormularioProduto(produto);
      } catch (error) {
        await Swal.fire({ icon: 'error', title: 'Erro ao buscar produto', text: error.message });
      }
    }

    if (alternar) {
      await alternarStatusProduto(alternar.dataset.alternarProduto, alternar.dataset.ativo === 'true');
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  configurarEventos();
  await carregarCategoriasEFornecedores();
  carregarProdutos();
});
