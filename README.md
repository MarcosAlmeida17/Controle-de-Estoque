# Estacionamentos

Aplicação didática para controle de estacionamento com área do proprietário e área do cliente mensalista.

## Stack

- HTML
- Tailwind CSS
- JavaScript Vanilla
- Vite
- SweetAlert2
- Supabase

## Como executar

```bash
npm install
npm run dev
```

Crie um arquivo `.env` com base em `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-publica
```

## Build

```bash
npm run build
```

O build será gerado na pasta `dist/`. O Vite está configurado com `base: '/estacionamentos/'` para publicação em GitHub Pages.

## Arquivos iniciais

| Arquivo          | Pergunta que responde                  |
| ---------------- | -------------------------------------- |
| AGENTS.md        | Como a IA deve trabalhar?              |
| MEMORY.md        | O que a IA deve saber sobre o projeto? |
| DESIGN_SYSTEM.md | Como a interface deve ser construída?  |

