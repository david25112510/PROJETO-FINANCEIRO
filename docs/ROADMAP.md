# Análise e roadmap do FinanceOps

Revisão realizada em 11 de setembro de 2026 sobre arquitetura, segurança,
experiência, domínio financeiro, testes e prontidão para publicação.

## Estado atual

O produto já tem uma base funcional ampla. A separação entre páginas, serviços
e repositórios é consistente, as rotas filtram dados pelo usuário e as entradas
são validadas com Zod. As telas principais funcionam em desktop e celular, a
compilação de produção passa e não há erros de lint.

O projeto ainda deve ser tratado como beta privado. Ele controla fluxo de caixa,
mas ainda não possui contas bancárias ou reconciliação de saldo. Open Finance e
WhatsApp expõem a experiência planejada, porém não têm provedores reais.

## Incremento de segurança concluído

- atualização do Next.js para uma versão que corrige duas vulnerabilidades críticas;
- fim do ciclo de redirecionamento causado por cookie de sessão inválido;
- validação de destino após login para impedir redirecionamento externo;
- remoção de páginas autenticadas do cache do PWA e expiração do cache antigo;
- alinhamento das versões do Prisma e atualização da documentação de instalação.

## Prioridade 1 — preparar um beta seguro

1. Criptografar o segredo TOTP em repouso e armazenar códigos de backup apenas
   como hashes de uso único.
2. Tornar auditoria e mutações financeiras atômicas com transações no banco.
3. Substituir rate limit e cache em memória por armazenamento compartilhado antes
   de executar mais de uma instância.
4. Definir proxies confiáveis antes de usar `x-forwarded-for` para bloqueio e
   auditoria; hoje o cabeçalho pode ser falsificado fora de uma borda controlada.
5. Criar testes de integração para autenticação, isolamento entre usuários,
   pagamentos, aportes, importação e exportação.
6. Adicionar auditoria de dependências ao pipeline de CI; lint, testes e build
   já são executados pelo GitHub Actions.

## Prioridade 2 — consolidar o modelo financeiro

1. Criar contas financeiras (corrente, poupança, dinheiro e investimento), saldo
   inicial, transferências e conciliação.
2. Definir duas visões: competência, pela data da compra, e caixa, pela data do
   pagamento da fatura. O dashboard atual usa a data da compra.
3. Registrar histórico de aportes, pagamentos de dívidas e parcelas de
   financiamentos, ligando cada evento ao fluxo de caixa.
4. Estender recorrências automaticamente; hoje são criadas somente 12 ocorrências.
5. Padronizar cálculos monetários em centavos inteiros ou Decimal de ponta a ponta
   para reduzir risco de arredondamento concorrente.
6. Adicionar orçamento mensal por categoria e alertas de limite.

## Prioridade 3 — completar a experiência

1. Criar gestão de perfil, usuários e categorias.
2. Melhorar estados vazios com ações claras e onboarding inicial.
3. Adicionar filtros globais de período e contas ao dashboard.
4. Incluir recuperação de senha e fluxo administrativo de convite.
5. Conectar um provedor real de Open Finance após definir consentimento, retenção
   e exclusão de dados.
6. Conectar Meta Cloud API ou Twilio ao módulo de WhatsApp.

## Riscos e limites conhecidos

- O Prisma mais recente ainda traz alertas em ferramentas auxiliares usadas no
  desenvolvimento. Esses caminhos não fazem parte do servidor PostgreSQL em
  execução, mas devem continuar sendo monitorados.
- ExcelJS mantém uma dependência transitiva antiga de `uuid`; o uso atual não
  chama a API vulnerável de buffer, mas a biblioteca deve ser substituída ou
  atualizada quando houver uma correção compatível.
- Fechamento de fatura, pagamentos, aportes e quitações usam leitura seguida de
  escrita. Requisições simultâneas podem produzir atualização perdida até que as
  operações sejam transacionais.
- Logs de auditoria são gravados depois da mutação. Uma falha intermediária pode
  deixar alteração sem registro ou registro sem a operação completa.

## Próximo incremento recomendado

Criar a camada de contas financeiras e um razão de movimentações. Esse passo dá
uma fonte única para saldos, pagamentos, aportes e transferências, e evita ampliar
o produto sobre um modelo de fluxo de caixa ambíguo. Em paralelo, os testes de
integração de autenticação e isolamento devem entrar no pipeline de CI.
