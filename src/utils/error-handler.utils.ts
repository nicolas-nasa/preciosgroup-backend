import { HttpException } from '@nestjs/common';

export interface ErrorDataType {
  type: string;
  message: string;
  stack?: string;
  statusCode?: number;
  response?: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Extrai e normaliza informações estruturadas de um erro
 * @param error - O erro a ser processado
 * @returns Objeto com dados estruturados do erro
 */
export function extractErrorData(error: unknown): ErrorDataType {
  const timestamp = new Date().toISOString();

  // Se for uma instância de Error padrão
  if (error instanceof Error) {
    const errorData: ErrorDataType = {
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      timestamp,
    };

    // Se for uma HttpException do NestJS
    if (error instanceof HttpException) {
      errorData.statusCode = error.getStatus();
      const response = error.getResponse();
      if (typeof response === 'object' && response !== null) {
        errorData.response = response as Record<string, unknown>;
      }
    }

    return errorData;
  }

  // Se for um objeto com propriedades
  if (typeof error === 'object' && error !== null) {
    return {
      type: 'UnknownObject',
      message: JSON.stringify(error),
      timestamp,
      ...(error as Record<string, unknown>),
    };
  }

  // Se for uma string ou outro tipo primitivo
  return {
    type: typeof error,
    message: String(error),
    timestamp,
  };
}

/**
 * Função segura para registrar erros com tentativas de acesso a diferentes propriedades
 * @param error - O erro a ser processado
 * @returns Objeto simplificado com dados do erro
 */
export function safeErrorExtraction(error: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  try {
    if (error instanceof Error) {
      result.type = error.constructor.name;
      result.message = error.message;
      result.stack = error.stack;

      if (error instanceof HttpException) {
        result.statusCode = error.getStatus();
        try {
          result.response = error.getResponse();
        } catch {
          // Ignorar se getResponse falhar
        }
      }
    } else if (typeof error === 'string') {
      result.message = error;
      result.type = 'string';
    } else if (error !== null && typeof error === 'object') {
      result.type = 'object';
      result.data = error;
    } else {
      result.message = String(error);
      result.type = typeof error;
    }
  } catch (e) {
    result.error = 'Failed to extract error data';
    result.fallback = String(error);
  }

  return result;
}
