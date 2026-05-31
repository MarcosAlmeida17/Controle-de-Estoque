import Swal from 'sweetalert2';
import { supabase } from './supabase.js';

const isLoginPage = window.location.pathname.endsWith('login.html');
const isPagesDirectory = window.location.pathname.includes('/pages/');

const THEME_KEY = 'controle-estoque-theme';

function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function applyInitialTheme() {
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function toggleTheme() {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function getLoginUrl() {
  return isPagesDirectory ? '../login.html' : './login.html';
}

function getLoginRedirectUrl() {
  return new URL(getLoginUrl(), window.location.href).href;
}

function setAuthMode(mode) {
  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  const title = document.querySelector('#auth-title');
  const description = document.querySelector('#auth-description');
  const loginFooter = document.querySelector('#footer-login-text');
  const registerFooter = document.querySelector('#footer-register-text');
  const buttons = document.querySelectorAll('[data-auth-mode]');

  buttons.forEach((button) => {
    if (button.dataset.authMode === mode) {
      button.classList.add('bg-slate-900', 'text-white');
      button.classList.remove('text-slate-700');
    } else {
      button.classList.remove('bg-slate-900', 'text-white');
      button.classList.add('text-slate-700');
    }
  });

  if (mode === 'register') {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    title.textContent = 'Cadastrar';
    description.textContent = 'Crie sua conta no sistema de controle de estoque.';
    loginFooter.classList.add('hidden');
    registerFooter.classList.remove('hidden');
  } else {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    title.textContent = 'Entrar';
    description.textContent = 'Acesse o sistema de controle de estoque.';
    loginFooter.classList.remove('hidden');
    registerFooter.classList.add('hidden');
  }
}

function initAuthModeToggle() {
  const buttons = document.querySelectorAll('[data-auth-mode]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setAuthMode(button.dataset.authMode);
    });
  });
}

async function requireAuth() {
  if (isLoginPage) return;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erro ao verificar sessão:', error.message);
  }

  if (!data?.session) {
    window.location.replace(getLoginUrl());
  }
}

function initThemeToggle() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  button.addEventListener('click', () => {
    toggleTheme();
  });
}

function initLoginForm() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      await Swal.fire({
        icon: 'warning',
        title: 'Dados incompletos',
        text: 'Informe e-mail e senha para continuar.'
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const mensagem = error.message === 'Invalid login credentials'
        ? 'Usuário ou senha inválidos. Verifique se a conta está criada e confirmada por e-mail.'
        : error.message;

      await Swal.fire({
        icon: 'error',
        title: 'Falha ao entrar',
        text: mensagem
      });
      return;
    }

    await Swal.fire({
      icon: 'success',
      title: 'Login realizado',
      text: 'Você será redirecionado para o painel.'
    });

    window.location.replace('./index.html');
  });
}

function initRegisterForm() {
  const form = document.querySelector('#register-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    if (!name || !email || !password || !confirmPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Dados incompletos',
        text: 'Preencha todos os campos para cadastrar.'
      });
      return;
    }

    if (password !== confirmPassword) {
      await Swal.fire({
        icon: 'warning',
        title: 'Senhas diferentes',
        text: 'As senhas informadas devem ser iguais.'
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getLoginRedirectUrl(),
        data: {
          nome: name
        }
      }
    });

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Falha ao cadastrar',
        text: error.message
      });
      return;
    }

    if (data?.session) {
      await Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado',
        text: 'Conta criada com sucesso. Você será redirecionado para o painel.'
      });
      window.location.replace('./index.html');
      return;
    }

    await Swal.fire({
      icon: 'success',
      title: 'Cadastro realizado',
      html: 'Conta criada. Verifique seu e-mail para confirmar o registro e depois faça login.',
      footer: 'Se não receber o e-mail, verifique a pasta de spam.'
    });

    setAuthMode('login');
  });
}

function initLogoutButtons() {
  const logoutLinks = document.querySelectorAll('[data-logout]');
  if (!logoutLinks.length) return;

  logoutLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      await supabase.auth.signOut();
      window.location.replace(getLoginUrl());
    });
  });
}

function setActiveMenu() {
  const links = document.querySelectorAll('aside nav a');
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add('bg-slate-100', 'dark:bg-slate-800', 'font-semibold');
    }
  });
}

async function loadDashboardData() {
  const dashboardRoot = document.querySelector('#dashboard-summary');
  if (!dashboardRoot) return;

  const totalProdutosNode = document.querySelector('#total-produtos');
  const produtosAtivosNode = document.querySelector('#produtos-ativos');
  const estoqueBaixoNode = document.querySelector('#estoque-baixo');
  const entradasHojeNode = document.querySelector('#entradas-hoje');
  const saidasHojeNode = document.querySelector('#saidas-hoje');
  const valorEstoqueNode = document.querySelector('#valor-estoque');
  const ultimasMovNode = document.querySelector('#ultimas-movimentacoes');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const [{ count: totalProdutos }, { count: produtosAtivos }, entradasHoje, saidasHoje, produtosData, movimentacoes] = await Promise.all([
    supabase.from('produtos').select('id', { count: 'exact', head: true }),
    supabase.from('produtos').select('id', { count: 'exact', head: true }).eq('ativo', true),
    supabase
      .from('movimentacoes_estoque')
      .select('id', { count: 'exact', head: true })
      .eq('tipo_movimentacao', 'entrada')
      .gte('data_movimentacao', startOfToday)
      .lt('data_movimentacao', startOfTomorrow),
    supabase
      .from('movimentacoes_estoque')
      .select('id', { count: 'exact', head: true })
      .eq('tipo_movimentacao', 'saida')
      .gte('data_movimentacao', startOfToday)
      .lt('data_movimentacao', startOfTomorrow),
    // buscar dados necessários para calcular valor total e produtos com estoque abaixo do mínimo
    supabase.from('produtos').select('estoque_atual, estoque_minimo, ativo, preco_venda'),
    supabase
      .from('movimentacoes_estoque')
      .select('id, tipo_movimentacao, quantidade, data_movimentacao, produto_id, produtos(nome)')
      .order('data_movimentacao', { ascending: false })
      .limit(5)
  ]);

  if (totalProdutosNode) totalProdutosNode.textContent = totalProdutos ?? 0;
  if (produtosAtivosNode) produtosAtivosNode.textContent = produtosAtivos ?? 0;
  if (estoqueBaixoNode) {
    const produtosList = produtosData.data ?? [];
    const countEstoqueBaixo = produtosList.reduce((acc, p) => {
      const ativo = p.ativo === true || String(p.ativo) === 'true';
      const atual = Number(p.estoque_atual) || 0;
      const minimo = Number(p.estoque_minimo) || 0;
      return acc + (ativo && atual < minimo ? 1 : 0);
    }, 0);
    estoqueBaixoNode.textContent = countEstoqueBaixo;
  }
  if (entradasHojeNode) entradasHojeNode.textContent = entradasHoje?.count ?? 0;
  if (saidasHojeNode) saidasHojeNode.textContent = saidasHoje?.count ?? 0;

  if (valorEstoqueNode) {
    const totalValue = (produtosData.data ?? []).reduce((sum, product) => {
      const quantidade = Number(product.estoque_atual) || 0;
      const preco = Number(product.preco_venda) || 0;
      return sum + quantidade * preco;
    }, 0);
    valorEstoqueNode.textContent = formatCurrency(totalValue);
  }

  if (ultimasMovNode) {
    if (movimentacoes.error || !movimentacoes.data || movimentacoes.data.length === 0) {
      ultimasMovNode.innerHTML = '<tr><td class="border-t border-slate-200" colspan="5">Nenhuma movimentação recente encontrada.</td></tr>';
    } else {
      ultimasMovNode.innerHTML = movimentacoes.data
        .map((item) => {
          const data = new Date(item.data_movimentacao).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          const produtoNome = item.produtos?.nome ?? item.produto_id ?? '—';
          const tipo = item.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída';
          const status = item.tipo_movimentacao === 'entrada' ? 'Concluída' : 'Concluída';

          return `
            <tr>
              <td class="border-t border-slate-200">${data}</td>
              <td class="border-t border-slate-200">${produtoNome}</td>
              <td class="border-t border-slate-200">${tipo}</td>
              <td class="border-t border-slate-200">${item.quantidade}</td>
              <td class="border-t border-slate-200">${status}</td>
            </tr>
          `;
        })
        .join('');
    }
  }
}

async function redirectIfAuthenticated() {
  if (!isLoginPage) return;
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    window.location.replace('./index.html');
  }
}

applyInitialTheme();

window.addEventListener('DOMContentLoaded', async () => {
  await redirectIfAuthenticated();
  await requireAuth();
  await loadDashboardData();
  initThemeToggle();
  initAuthModeToggle();
  initLoginForm();
  initRegisterForm();
  initLogoutButtons();
  setActiveMenu();
});
