# Publicação para uso pessoal

O FinanceOps foi preparado para ser publicado na Vercel com PostgreSQL no
Neon. O cadastro público não existe: somente o usuário criado pelo comando de
seed consegue entrar.

## 1. Conexões do banco

No painel do Neon, copie duas conexões do mesmo banco:

- `DATABASE_URL`: conexão com pool, cujo endereço contém `-pooler`;
- `DIRECT_URL`: conexão direta, usada apenas para aplicar migrações.

Mantenha essas duas informações apenas nos ambientes protegidos. Nunca as
adicione ao GitHub.

## 2. Variáveis da Vercel

Ao importar o repositório na Vercel, cadastre estas variáveis no ambiente de
produção:

- `DATABASE_URL`;
- `DIRECT_URL`;
- `SESSION_SECRET`, com pelo menos 32 caracteres aleatórios;
- `LOG_LEVEL=info`.

As variáveis `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` são
necessárias somente enquanto o primeiro usuário é criado. Depois, podem ser
removidas da Vercel.

## 3. Primeiro acesso

Antes da publicação, aplique as migrações e crie o usuário inicial em um
ambiente protegido:

```bash
npm run db:deploy
npm run db:seed
```

O seed não possui senha padrão e recusa senhas com menos de 12 caracteres. Se
o e-mail já existir, ele não altera a conta nem a senha.

## 4. Publicação

Importe o repositório do GitHub como projeto Next.js na Vercel. O comando
`vercel-build` gera o cliente Prisma, aplica migrações pendentes e compila o
aplicativo. Cada atualização enviada à branch `master` gera uma nova versão.

Depois da publicação, confirme:

1. `/api/health` responde com `status: ok`;
2. `/login` abre sem erros;
3. o usuário inicial consegue entrar;
4. uma receita de teste pode ser criada e excluída;
5. a autenticação em dois fatores está ativada na página de segurança.

## 5. Cópias de segurança

Ative a retenção de histórico oferecida pelo plano do Neon. Antes de mudanças
grandes no banco, crie uma ramificação ou restaure uma cópia em um banco de
teste. Exporte periodicamente os relatórios financeiros em PDF ou Excel como
cópia adicional dos dados mais importantes.
