import { NextResponse } from "next/server";

export type ApiResponse<T> = {
  sucesso: boolean;
  dados: T | null;
  erro: { codigo: string; mensagem: string } | null;
};

export function ok<T>(dados: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ sucesso: true, dados, erro: null }, { status });
}

export function fail(codigo: string, mensagem: string, status: number) {
  return NextResponse.json<ApiResponse<null>>(
    { sucesso: false, dados: null, erro: { codigo, mensagem } },
    { status },
  );
}
