# AGENTS.md

Este arquivo define as instruções permanentes para agentes de IA que forem trabalhar neste projeto. Ele deve ser lido como um contrato de desenvolvimento: descreve regras obrigatórias, padrões técnicos e comportamentos que não podem ser ignorados durante alterações no código.

Use este arquivo para orientar a IA sobre COMO trabalhar no projeto.

## Papel do agente

- Atuar como apoio técnico no desenvolvimento da aplicação didática de controle de estoque.
- Preservar as regras de negócio já definidas.
- Manter o projeto compatível com HTML, Tailwind CSS, JavaScript Vanilla, Vite, SweetAlert2 e Supabase.
- Evitar alterações fora do escopo solicitado.
- Nunca substituir regras de negócio por dados fixos ou placeholders.

## Regras permanentes de movimentações de estoque

- As páginas `pages/estoque.html`, `pages/produtos.html` e `pages/relatorios.html` não podem ficar como placeholders.
- `pages/estoque.html` deve usar `js/pages/estoque.js`.
- `pages/produtos.html` deve usar `js/pages/produtos.js`.
- `pages/relatorios.html` deve usar `js/pages/relatorios.js`.
- Entrada deve aumentar o estoque do produto.
- Saída deve diminuir o estoque do produto.
- Não permitir estoque negativo.
- Não permitir movimentações em produtos inativos.
- Toda movimentação deve registrar usuário, data e observação.
- Todas as ações devem validar dados no front-end, confirmar com SweetAlert2 e exibir erros reais do Supabase.
- Relatórios devem considerar filtros por produto, categoria, período e tipo de movimentação.
- Todas as listagens devem utilizar paginação com `.range(inicio, fim)` e `count: 'exact'`.

## Dashboard

- Total de produtos.
- Produtos ativos.
- Produtos com estoque abaixo do mínimo.
- Entradas realizadas hoje.
- Saídas realizadas hoje.
- Valor total do estoque.
- Últimas movimentações.

## Interface

- Todo texto visível deve estar em português do Brasil.
- Utilizar Heroicons.
- Utilizar SweetAlert2.
- Não utilizar alert(), confirm() ou prompt().

## Desenvolvimento

- Utilizar apenas HTML, Tailwind CSS e JavaScript Vanilla.
- Utilizar Supabase para autenticação e banco.
- Utilizar async/await.
- Utilizar try/catch.
- Utilizar import.meta.env.
- Configurar RLS.
- Garantir compatibilidade com GitHub Pages.

## CRUD obrigatório

Todos os cadastros devem possuir:
- Listagem com paginação.
- Inclusão.
- Edição.
- Inativação lógica.
- Reativação.
- Busca.
- Filtros.
- Validação de campos obrigatórios.
