# MEMORY.md

## Contexto do projeto

Sistema didático de Controle de Estoque para uso acadêmico.

## Tecnologias

### Front-end
- HTML
- Tailwind CSS
- JavaScript Vanilla
- Vite
- SweetAlert2

### Back-end
- Supabase

## Objetivo

Permitir:

- Cadastro de categorias.
- Cadastro de fornecedores.
- Cadastro de produtos.
- Controle de entradas.
- Controle de saídas.
- Controle de estoque mínimo.
- Relatórios gerenciais.
- Dashboard administrativo.

## Perfis

### Administrador
- Dashboard.
- CRUD completo.
- Relatórios.
- Gestão de usuários.

### Operador
- Entradas.
- Saídas.
- Consulta de produtos.
- Consulta de relatórios.

## Estrutura principal

/controle-estoque
├── index.html
├── login.html
├── pages
├── js
├── css
├── assets

## Entidades

### perfis
- id
- user_id
- nome
- email
- tipo_usuario

### categorias
- id
- nome
- descricao
- ativo

### fornecedores
- id
- nome
- telefone
- email
- endereco
- ativo

### produtos
- id
- categoria_id
- fornecedor_id
- codigo
- nome
- descricao
- preco_custo
- preco_venda
- estoque_atual
- estoque_minimo
- ativo

### movimentacoes_estoque
- id
- produto_id
- tipo_movimentacao
- quantidade
- observacao
- usuario_id
- data_movimentacao

## Regras de negócio

- Não permitir estoque negativo.
- Toda entrada aumenta o estoque.
- Toda saída reduz o estoque.
- Produtos inativos não podem receber movimentações.
- Toda movimentação deve ser registrada.
- Alertar quando estoque estiver abaixo do mínimo.
- Exibir indicadores reais no dashboard.

## Relatórios

- Produtos com estoque baixo.
- Entradas por período.
- Saídas por período.
- Histórico completo.
- Produtos mais movimentados.
- Valor financeiro do estoque.

## Dashboard

Indicadores mínimos:
- Total de produtos.
- Produtos ativos.
- Produtos com estoque baixo.
- Entradas hoje.
- Saídas hoje.
- Valor total em estoque.
- Últimas movimentações.
