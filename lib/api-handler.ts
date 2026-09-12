import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { AppError, ForbiddenError } from "@/lib/errors";
import { fail } from "@/lib/api-response";
import { logger } from "@/lib/logger";

type RouteHandler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function assertSameOrigin(req: NextRequest) {
  if (!MUTATING_METHODS.has(req.method)) return;

  const origin = req.headers.get("origin");
  if (!origin) return;

  const requestOrigin = new URL(req.url).origin;
  if (origin !== requestOrigin) {
    throw new ForbiddenError("Origem da requisição não permitida.", "ORIGEM_INVALIDA");
  }
}

/**
 * Envolve toda rota /api/v1/** para centralizar o tratamento de erros e o
 * logging estruturado, garantindo o contrato padrão de resposta em falhas
 * não tratadas explicitamente pelo handler.
 */
export function createApiHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    const start = Date.now();
    const route = new URL(req.url).pathname;

    try {
      assertSameOrigin(req);
      const response = await handler(req, ctx);
      logger.info({ route, method: req.method, status: response.status, durationMs: Date.now() - start }, "requisicao_concluida");
      return response;
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn({ route, method: req.method, codigo: error.codigo, durationMs: Date.now() - start }, error.message);
        return fail(error.codigo, error.message, error.status);
      }

      if (error instanceof ZodError) {
        const mensagem = error.issues.map((issue) => issue.message).join("; ");
        logger.warn({ route, method: req.method, durationMs: Date.now() - start }, mensagem);
        return fail("VALIDACAO_INVALIDA", mensagem, 400);
      }

      if (error instanceof SyntaxError) {
        logger.warn({ route, method: req.method, durationMs: Date.now() - start }, "json_invalido");
        return fail("JSON_INVALIDO", "Corpo da requisição inválido.", 400);
      }

      logger.error(
        { route, method: req.method, err: error, durationMs: Date.now() - start },
        "erro_nao_tratado",
      );
      return fail("ERRO_INTERNO", "Ocorreu um erro inesperado. Tente novamente.", 500);
    }
  };
}
