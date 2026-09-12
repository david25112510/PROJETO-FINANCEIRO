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

Marque `DATABASE_URL`, `DIRECT_URL` e `SESSION_SECRET` como variáveis sensíveis.
Não configure `NODE_ENV`: a Vercel define essa variável para o ambiente de
produção. A branch de produção do projeto deve ser `master`.

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

O Neon mantém histórico para restauração instantânea. No plano gratuito, a
janela disponível é de até 6 horas ou 1 GB de alterações, o que ocorrer
primeiro. Planos pagos podem oferecer uma janela maior, mas nenhum upgrade deve
ser feito sem decisão explícita do proprietário.

Procedimento de recuperação:

1. abra o projeto no Neon e acesse **Backup & Restore**;
2. use a consulta temporal para localizar o instante anterior ao problema;
3. restaure primeiro para uma branch separada sempre que a interface oferecer
   essa opção;
4. confira os dados recuperados antes de promover ou copiar qualquer conteúdo;
5. nunca redefina a branch principal sem uma revisão específica do impacto.

Antes de mudanças grandes no banco, crie uma branch temporária de recuperação.
Exporte periodicamente os relatórios financeiros em PDF ou Excel como cópia
adicional dos dados mais importantes.

## 6. Atualizações contínuas

Depois que o repositório estiver conectado à Vercel, cada push para `master`
deve criar um deployment de produção. O GitHub Actions valida lint, testes e
build, enquanto a Vercel executa `vercel-build`, aplica migrations pendentes e
publica a nova versão.

Variáveis do banco de produção não devem ser reutilizadas em deployments de
preview. Se previews forem habilitados no futuro, use uma branch separada do
Neon para evitar que uma migration de teste altere o banco real.
