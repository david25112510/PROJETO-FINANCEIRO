# FinanceOps

Aplicação web de gestão financeira pessoal com receitas, despesas, cartões,
faturas, dívidas, financiamentos, metas, relatórios, importação de extratos e
indicadores de saúde financeira.

## Recursos atuais

- autenticação com sessões, bloqueio por tentativas e 2FA por TOTP;
- receitas e despesas simples, recorrentes ou parceladas;
- cartões, compras parceladas, ciclos de fatura e pagamentos;
- dívidas, simulação de quitação e financiamentos Price/SAC;
- metas financeiras e sugestão de aporte;
- relatórios por período com exportação em PDF e Excel;
- importação de arquivos OFX e CSV com detecção de duplicidade;
- PWA responsivo com shell público para indisponibilidade de rede;
- base preparada para Open Finance e WhatsApp, ainda sem provedor real.

## Tecnologias

Next.js 16, React 19, TypeScript, PostgreSQL, Prisma, Tailwind CSS e Zod.

## Configuração local

1. Copie `.env.example` para `.env` e ajuste os valores.
2. Instale as dependências com `npm install`.
3. Aplique as migrações com `npm run db:deploy`.
4. Defina as variáveis `SEED_ADMIN_*` e crie o usuário inicial com `npm run db:seed`.
5. Inicie o projeto com `npm run dev` e acesse `http://localhost:3000`.

Não use as credenciais de exemplo em ambientes publicados.

## Verificações

```bash
npm run lint
npm test
npm run build
```

## Arquitetura

- `app/`: páginas e rotas HTTP;
- `features/`: interfaces e comunicação dos módulos no navegador;
- `services/`: regras de negócio;
- `repositories/`: acesso ao banco;
- `prisma/`: esquema e migrações;
- `tests/`: testes automatizados das regras críticas.

O plano de evolução e os riscos conhecidos estão em `docs/ROADMAP.md`.
O passo a passo para publicar o sistema está em `docs/PUBLICACAO.md`.
