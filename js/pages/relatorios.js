import Swal from 'sweetalert2';
import { supabase } from '../supabase.js';

const PAGE_SIZE = 10;
let paginaAtual = 1;
let totalRegistros = 0;
let filtrosAtuais = {
  produto: '',
  categoria: '',
  tipo: 'todos',
  inicio: '',
  fim: ''
};

const formFiltros = document.querySelector('#form-filtros-relatorios');
const btnLimpar = document.querySelector('#limpar-filtros-relatorios');
const tabela = document.querySelector('#tabela-relatorios');
const infoPaginacao = document.querySelector('#info-paginacao-relatorios');
const btnAnterior = document.querySelector('#pagina-anterior-relatorios');
const btnProxima = document.querySelector('#proxima-pagina-relatorios');
const relatorioTotalEl = document.querySelector('#relatorios-total');
const relatorioEntradasEl = document.querySelector('#relatorios-entradas');
const relatorioSaidasEl = document.querySelector('#relatorios-saidas');
const relatorioProdutosDistintosEl = document.querySelector('#relatorios-produtos-distintos');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatarData(data) {
  if (!data) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(data));
}

function formatarTipo(tipo) {
  const entrada = tipo === 'entrada';
  const classe = entrada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const texto = entrada ? 'Entrada' : 'Saída';
  return `<span class="rounded-full px-3 py-1 text-xs font-semibold ${classe}">${texto}</span>`;
}

function renderizarTabela(movimentacoes) {
  if (!movimentacoes.length) {
    tabela.innerHTML = '<tr><td colspan="7" class="border-t border-slate-200 text-center text-slate-500">Nenhuma movimentação encontrada.</td></tr>';
    return;
  }

  tabela.innerHTML = movimentacoes.map((movimentacao) => `
    <tr>
      <td class="border-t border-slate-200">${formatarData(movimentacao.data_movimentacao)}</td>
      <td class="border-t border-slate-200">${escapeHtml(movimentacao.produtos?.nome || '-')}</td>
      <td class="border-t border-slate-200">${escapeHtml(movimentacao.produtos?.categorias?.nome || '-')}</td>
      <td class="border-t border-slate-200">${formatarTipo(movimentacao.tipo_movimentacao)}</td>
      <td class="border-t border-slate-200 font-semibold">${movimentacao.quantidade}</td>
      <td class="border-t border-slate-200">${escapeHtml(movimentacao.observacao || '-')}</td>
      <td class="border-t border-slate-200">${escapeHtml(movimentacao.usuario_id ? movimentacao.usuario_id.slice(0, 8) : '-')}</td>
    </tr>
  `).join('');
}

function atualizarPaginacao() {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));
  infoPaginacao.textContent = `Página ${paginaAtual} de ${totalPaginas} • ${totalRegistros} registro(s)`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

function fimDoDia(data) {
  return `${data}T23:59:59.999`;
}

async function buscarProdutosFiltrados() {
  const precisaFiltrarProduto = filtrosAtuais.produto || filtrosAtuais.categoria;
  if (!precisaFiltrarProduto) return null;
  try {
    // Se filtrou por categoria, buscar IDs das categorias correspondentes
    let produtoIds = null;

    if (filtrosAtuais.categoria) {
      const { data: categorias, error: errCat } = await supabase
        .from('categorias')
        .select('id')
        .ilike('nome', `%${filtrosAtuais.categoria}%`);
      if (errCat) throw errCat;
      const categoriaIds = (categorias ?? []).map((c) => c.id);
      if (categoriaIds.length === 0) return [];

      // Agora buscar produtos que pertençam a essas categorias (e opcionalmente contenham o termo de produto)
      if (filtrosAtuais.produto) {
        const { data, error } = await supabase
          .from('produtos')
          .select('id')
          .in('categoria_id', categoriaIds)
          .or(`nome.ilike.%${filtrosAtuais.produto}%,codigo.ilike.%${filtrosAtuais.produto}%`);
        if (error) throw error;
        produtoIds = (data ?? []).map((p) => p.id);
      } else {
        const { data, error } = await supabase.from('produtos').select('id').in('categoria_id', categoriaIds);
        if (error) throw error;
        produtoIds = (data ?? []).map((p) => p.id);
      }
    } else if (filtrosAtuais.produto) {
      // Apenas filtro por produto (nome/código)
      const { data, error } = await supabase
        .from('produtos')
        .select('id')
        .or(`nome.ilike.%${filtrosAtuais.produto}%,codigo.ilike.%${filtrosAtuais.produto}%`);
      if (error) throw error;
      produtoIds = (data ?? []).map((p) => p.id);
    }

    return produtoIds;
  } catch (error) {
    throw error;
  }
}

async function carregarRelatorio() {
  try {
    const idsProdutos = await buscarProdutosFiltrados();
    if (Array.isArray(idsProdutos) && idsProdutos.length === 0) {
      totalRegistros = 0;
      renderizarTabela([]);
      atualizarPaginacao();
      return;
    }

    const inicio = (paginaAtual - 1) * PAGE_SIZE;
    const fim = inicio + PAGE_SIZE - 1;
    let query = supabase
      .from('movimentacoes_estoque')
      .select('id,tipo_movimentacao,quantidade,observacao,data_movimentacao,usuario_id,produtos(nome,codigo,categorias(nome))', { count: 'exact' })
      .order('data_movimentacao', { ascending: false })
      .range(inicio, fim);

    if (filtrosAtuais.tipo !== 'todos') {
      query = query.eq('tipo_movimentacao', filtrosAtuais.tipo);
    }

    if (filtrosAtuais.inicio) {
      query = query.gte('data_movimentacao', filtrosAtuais.inicio);
    }

    if (filtrosAtuais.fim) {
      query = query.lte('data_movimentacao', fimDoDia(filtrosAtuais.fim));
    }

    if (Array.isArray(idsProdutos)) {
      query = query.in('produto_id', idsProdutos);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    totalRegistros = count ?? 0;
    const registros = data ?? [];
    renderizarTabela(registros);
    atualizarPaginacao();
    atualizarResumoRelatorios(registros);
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao carregar relatório', text: error.message });
  }
}

function atualizarResumoRelatorios(registros) {
  relatorioTotalEl.textContent = String(totalRegistros ?? 0);
  const entradas = registros.filter((item) => item.tipo_movimentacao === 'entrada').length;
  const saidas = registros.filter((item) => item.tipo_movimentacao === 'saida').length;
  const produtosDistintos = new Set(registros.map((item) => item.produto_id)).size;

  relatorioEntradasEl.textContent = String(entradas);
  relatorioSaidasEl.textContent = String(saidas);
  relatorioProdutosDistintosEl.textContent = String(produtosDistintos);
}

function lerFiltros() {
  const formData = new FormData(formFiltros);
  filtrosAtuais = {
    produto: String(formData.get('produto') || '').trim(),
    categoria: String(formData.get('categoria') || '').trim(),
    tipo: String(formData.get('tipo') || 'todos'),
    inicio: String(formData.get('inicio') || ''),
    fim: String(formData.get('fim') || '')
  };
}

function configurarEventos() {
  formFiltros?.addEventListener('submit', (event) => {
    event.preventDefault();
    lerFiltros();
    paginaAtual = 1;
    carregarRelatorio();
  });

  btnLimpar?.addEventListener('click', () => {
    formFiltros.reset();
    filtrosAtuais = { produto: '', categoria: '', tipo: 'todos', inicio: '', fim: '' };
    paginaAtual = 1;
    carregarRelatorio();
  });

  btnAnterior?.addEventListener('click', () => {
    if (paginaAtual > 1) {
      paginaAtual -= 1;
      carregarRelatorio();
    }
  });

  btnProxima?.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(totalRegistros / PAGE_SIZE)) {
      paginaAtual += 1;
      carregarRelatorio();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  configurarEventos();
  carregarRelatorio();
});


