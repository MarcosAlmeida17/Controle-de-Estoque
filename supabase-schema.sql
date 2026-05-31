-- Schema de tabelas para o projeto Controle de Estoque
-- Execute este script no editor SQL do Supabase.

-- Extensão para gerar UUIDs seguros
create extension if not exists "pgcrypto";

-- Função de atualização automática de timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela de perfis de usuário
create table if not exists perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo_usuario text not null default 'operador',
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create trigger perfis_updated_at
before update on perfis
for each row
execute function update_updated_at();

-- Tabela de categorias
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create trigger categorias_updated_at
before update on categorias
for each row
execute function update_updated_at();

-- Tabela de fornecedores
create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  endereco text,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create trigger fornecedores_updated_at
before update on fornecedores
for each row
execute function update_updated_at();

-- Tabela de produtos
create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete restrict,
  fornecedor_id uuid references fornecedores(id) on delete set null,
  codigo text not null unique,
  nome text not null,
  descricao text,
  preco_custo numeric(12,2) not null default 0,
  preco_venda numeric(12,2) not null default 0,
  estoque_atual integer not null default 0,
  estoque_minimo integer not null default 0,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create trigger produtos_updated_at
before update on produtos
for each row
execute function update_updated_at();

-- Tabela de movimentações de estoque
create table if not exists movimentacoes_estoque (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  tipo_movimentacao text not null check (tipo_movimentacao in ('entrada', 'saida')),
  quantidade integer not null check (quantidade > 0),
  observacao text,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  data_movimentacao timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create trigger movimentacoes_estoque_updated_at
before update on movimentacoes_estoque
for each row
execute function update_updated_at();

-- Habilita RLS para as tabelas principais
alter table perfis enable row level security;
alter table categorias enable row level security;
alter table fornecedores enable row level security;
alter table produtos enable row level security;
alter table movimentacoes_estoque enable row level security;

-- Políticas de acesso para usuários autenticados
create policy "Usuários autenticados podem consultar perfis" on perfis
for select
using (auth.uid() = user_id);

create policy "Usuários autenticados podem inserir perfis" on perfis
for insert
with check (auth.uid() = user_id);

create policy "Usuários autenticados podem atualizar seu perfil" on perfis
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuários autenticados podem consultar categorias" on categorias
for select
using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir categorias" on categorias
for insert
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar categorias" on categorias
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem consultar fornecedores" on fornecedores
for select
using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir fornecedores" on fornecedores
for insert
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar fornecedores" on fornecedores
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem consultar produtos" on produtos
for select
using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir produtos" on produtos
for insert
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar produtos" on produtos
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem consultar movimentações" on movimentacoes_estoque
for select
using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem inserir movimentações" on movimentacoes_estoque
for insert
with check (auth.uid() = usuario_id);

create policy "Usuários autenticados podem atualizar movimentações próprias" on movimentacoes_estoque
for update
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);
