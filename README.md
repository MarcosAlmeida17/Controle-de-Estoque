# Sistema Didático de Controle de Estoque

Projeto didático para controle de estoque, desenvolvido para uso em sala de aula com HTML, Tailwind CSS, JavaScript Vanilla, Vite, SweetAlert2 e Supabase.

O objetivo é construir uma aplicação administrativa com autenticação, cadastros, controle de entrada e saída de estoque, consulta do produtos e histórico de movimentações.

## Documentos obrigatórios do projeto

Antes de alterar qualquer parte do sistema, leia estes arquivos:

- [AGENTS.md](AGENTS.md): define as regras permanentes para agentes de IA e para o desenvolvimento assistido. Ele funciona como contrato técnico do projeto, registrando padrões obrigatórios, regras de negócio, autenticação, paginação, RLS, GRANTs e limites do que não deve ser alterado.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): documenta o padrão visual da aplicação. Deve orientar cores, tipografia, layout, componentes, ícones Heroicons, tabelas, formulários, feedbacks com SweetAlert2 e consistência entre tema claro e escuro.
- [MEMORY.md](MEMORY.md): registra a memória funcional do projeto. Deve ser usado para entender o contexto, as entidades, os perfis de usuário, os fluxos principais, as decisões já tomadas e as regras de negócio que precisam ser preservadas.

Esses três arquivos são parte essencial do projeto. Eles evitam perda de contexto, reduzem retrabalho e ajudam a manter a aplicação coerente mesmo quando diferentes alunos ou agentes de IA trabalharem no código.

## Escopo funcional

O sistema deve contemplar:

- Login com autenticação nativa do Supabase.
- Área do proprietário.
- Área do cliente mensalista.
- CRUD de marcas.
- CRUD de modelos.
- CRUD de clientes.
- CRUD de produtos.
- Registro de entrada
- Registro de saída
- Histórico de movimentações.
- Dashboard com dados reais do Supabase.

## Regras técnicas principais

- Usar HTML, Tailwind CSS e JavaScript Vanilla.
- Usar Vite como ferramenta de build e servidor de desenvolvimento.
- Usar Supabase para autenticação e banco de dados.
- Acessar variáveis de ambiente com `import.meta.env`.
- Não hardcodear URL ou chave do Supabase.
- Usar SweetAlert2 para mensagens de sucesso, erro, confirmação e alerta.
- Não usar `alert()`, `confirm()` ou `prompt()` nativos.
- Usar Heroicons nos menus, botões de ação e controles principais.
- Manter textos visíveis em português do Brasil com acentuação correta.
- Usar paginação com `.range(inicio, fim)` e `count: 'exact'` nas listagens.
- Configurar RLS e GRANTs necessários no Supabase.

## Estrutura esperada

```text
/estacionamentos
|-- index.html
|-- login.html
|-- pages/
|-- cliente/
|-- js/
|-- css/
|-- assets/
|-- AGENTS.md
|-- DESIGN_SYSTEM.md
|-- MEMORY.md
`-- README.md
```

## Variáveis de ambiente

Use o arquivo `.env.example` como referência para criar o `.env` local.

As credenciais do Supabase devem ser configuradas por variáveis de ambiente e nunca devem ser fixadas diretamente no código.

## Desenvolvimento

Quando o projeto estiver com Vite configurado, os comandos esperados serão:

```bash
npm install
npm run dev
npm run build
```

Caso esses scripts ainda não existam, consulte `AGENTS.md`, `DESIGN_SYSTEM.md` e `MEMORY.md` antes de criar a estrutura inicial.

## Deploy

O projeto deve ser compatível com hospedagem estática e GitHub Pages.

Requisitos mínimos:

- Gerar build na pasta `dist/`.
- Configurar corretamente a propriedade `base` no `vite.config.js`.
- Garantir que os caminhos funcionem em ambiente estático.
- Não depender de servidor próprio.

### Deploy com GitHub Pages

Use os scripts do `package.json` para publicar no GitHub Pages:

```bash
npm install
npm run deploy
```

Se necessário, ajuste o nome do repositório no GitHub e confirme que a opção de Pages esteja apontando para a branch `gh-pages`.

## Observação para agentes de IA

Qualquer agente de IA que trabalhe neste repositório deve tratar [AGENTS.md](AGENTS.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) e [MEMORY.md](MEMORY.md) como fontes obrigatórias de contexto.

Antes de implementar, corrigir ou refatorar, confirme se a alteração respeita:

- As regras permanentes de negócio.
- O padrão visual documentado.
- A memória funcional do sistema.
- A arquitetura com Supabase, Vite e JavaScript Vanilla.
- A compatibilidade com GitHub Pages.
