import { consentimentoOpenFinanceRepository } from "@/repositories/consentimentoOpenFinanceRepository";
import { auditLogRepository } from "@/repositories/auditLogRepository";
import { ValidationError } from "@/lib/errors";

export type StatusConsentimento = {
  consentido: boolean;
  consentidoEm: string | null;
  revogadoEm: string | null;
};

/**
 * Porta (no sentido de arquitetura hexagonal) que um provedor real de Open
 * Finance (ex.: Belvo, Pluggy, um agregador certificado pelo Open Finance
 * Brasil) implementaria. Nenhuma implementação concreta existe neste projeto —
 * conectar um provedor real é o próximo passo fora do escopo atual.
 */
export interface ProvedorOpenFinance {
  nome: string;
  sincronizarTransacoes(userId: string): Promise<{ transacoesImportadas: number }>;
}

/** Nenhum provedor real está configurado — placeholder intencional. */
function obterProvedorConfigurado(): ProvedorOpenFinance | null {
  return null;
}

function serializar(consentimento: {
  consentido: boolean;
  consentidoEm: Date | null;
  revogadoEm: Date | null;
} | null): StatusConsentimento {
  return {
    consentido: consentimento?.consentido ?? false,
    consentidoEm: consentimento?.consentidoEm?.toISOString() ?? null,
    revogadoEm: consentimento?.revogadoEm?.toISOString() ?? null,
  };
}

export const openFinanceService = {
  async obterStatus(userId: string): Promise<StatusConsentimento> {
    const consentimento = await consentimentoOpenFinanceRepository.buscarPorUsuario(userId);
    return serializar(consentimento);
  },

  async concederConsentimento(userId: string): Promise<StatusConsentimento> {
    const consentimento = await consentimentoOpenFinanceRepository.conceder(userId);
    await auditLogRepository.create({ userId, action: "CONSENTIMENTO_CONCEDIDO", entity: "OpenFinance" });
    return serializar(consentimento);
  },

  async revogarConsentimento(userId: string): Promise<StatusConsentimento> {
    const consentimento = await consentimentoOpenFinanceRepository.revogar(userId);
    await auditLogRepository.create({ userId, action: "CONSENTIMENTO_REVOGADO", entity: "OpenFinance" });
    return serializar(consentimento);
  },

  /**
   * Nunca simula dados bancários. Exige consentimento explícito e um
   * provedor real configurado; sem os dois, falha com um erro honesto.
   */
  async sincronizar(userId: string): Promise<{ transacoesImportadas: number }> {
    const consentimento = await consentimentoOpenFinanceRepository.buscarPorUsuario(userId);
    if (!consentimento?.consentido) {
      throw new ValidationError(
        "É necessário conceder consentimento antes de sincronizar via Open Finance.",
        "CONSENTIMENTO_NECESSARIO",
      );
    }

    const provedor = obterProvedorConfigurado();
    if (!provedor) {
      throw new ValidationError(
        "Nenhum provedor Open Finance está configurado neste ambiente.",
        "PROVEDOR_NAO_CONFIGURADO",
      );
    }

    return provedor.sincronizarTransacoes(userId);
  },
};
