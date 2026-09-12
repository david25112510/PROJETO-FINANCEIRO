/**
 * Hierarquia de erros de aplicação. Services lançam essas classes;
 * a camada de API (lib/api-handler.ts) as traduz para o contrato padrão de resposta.
 */
export class AppError extends Error {
  readonly codigo: string;
  readonly status: number;

  constructor(codigo: string, mensagem: string, status: number) {
    super(mensagem);
    this.name = "AppError";
    this.codigo = codigo;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(mensagem: string, codigo = "VALIDACAO_INVALIDA") {
    super(codigo, mensagem, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensagem = "Credenciais inválidas ou sessão expirada.", codigo = "NAO_AUTORIZADO") {
    super(codigo, mensagem, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(mensagem = "Você não tem permissão para esta ação.", codigo = "PROIBIDO") {
    super(codigo, mensagem, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(mensagem = "Recurso não encontrado.", codigo = "NAO_ENCONTRADO") {
    super(codigo, mensagem, 404);
  }
}

export class ConflictError extends AppError {
  constructor(mensagem: string, codigo = "CONFLITO") {
    super(codigo, mensagem, 409);
  }
}
