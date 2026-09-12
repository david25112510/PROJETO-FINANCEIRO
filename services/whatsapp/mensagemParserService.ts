export type IntencaoMensagem =
  | { tipo: "REGISTRAR_DESPESA"; valor: number; descricao: string }
  | { tipo: "REGISTRAR_RECEITA"; valor: number; descricao: string }
  | { tipo: "CONSULTAR_SALDO" }
  | { tipo: "AJUDA" }
  | { tipo: "DESCONHECIDO"; textoOriginal: string };

const PALAVRAS_DESPESA = ["gastei", "gasto", "paguei", "pagamento", "comprei", "compra"];
const PALAVRAS_RECEITA = ["recebi", "receita", "ganhei", "ganho", "entrada", "entrou"];
const PALAVRAS_SALDO = ["saldo"];
const PALAVRAS_AJUDA = ["ajuda", "help", "comandos", "menu"];
const PALAVRAS_DESCARTAVEIS = ["r$", "reais", "de", "do", "da", "no", "na", "em", "com", "pra", "para"];

function extrairMatchValor(texto: string): RegExpMatchArray | null {
  return texto.match(/\d+(?:[.,]\d{1,2})?/);
}

function limparDescricao(texto: string, matchValor: string, palavrasChave: string[]): string {
  let limpo = texto.replace(matchValor, " ");
  for (const palavra of [...palavrasChave, ...PALAVRAS_DESCARTAVEIS]) {
    limpo = limpo.replace(new RegExp(`\\b${palavra}\\b`, "gi"), " ");
  }
  limpo = limpo.replace(/\s+/g, " ").trim();
  return limpo || "Lançamento via WhatsApp";
}

/**
 * Interpreta uma mensagem de texto livre em português e extrai a intenção do
 * comando. É casamento de padrões simples (palavras-chave + regex de valor),
 * não IA/NLP — suficiente para comandos curtos e diretos de um chatbot.
 */
export function interpretarMensagem(textoOriginal: string): IntencaoMensagem {
  const texto = textoOriginal.trim();
  const textoLower = texto.toLowerCase();

  if (PALAVRAS_AJUDA.some((p) => textoLower === p || textoLower.startsWith(`${p} `))) {
    return { tipo: "AJUDA" };
  }
  if (PALAVRAS_SALDO.some((p) => textoLower.includes(p))) {
    return { tipo: "CONSULTAR_SALDO" };
  }

  const ehDespesa = PALAVRAS_DESPESA.some((p) => textoLower.includes(p));
  const ehReceita = !ehDespesa && PALAVRAS_RECEITA.some((p) => textoLower.includes(p));

  if (ehDespesa || ehReceita) {
    const matchValor = extrairMatchValor(texto);
    const valor = matchValor ? Number(matchValor[0].replace(",", ".")) : null;

    if (matchValor && valor !== null && valor > 0) {
      const palavrasChave = ehDespesa ? PALAVRAS_DESPESA : PALAVRAS_RECEITA;
      return {
        tipo: ehDespesa ? "REGISTRAR_DESPESA" : "REGISTRAR_RECEITA",
        valor,
        descricao: limparDescricao(texto, matchValor[0], palavrasChave),
      };
    }
  }

  return { tipo: "DESCONHECIDO", textoOriginal: texto };
}
