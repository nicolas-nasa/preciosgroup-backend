export enum FriendlyActionEnum {
  // Autenticação
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  REFRESH_TOKEN = 'Atualizar Token',

  // Operações CRUD
  CREATE = 'Criar',
  READ = 'Visualizar',
  UPDATE = 'Atualizar',
  DELETE = 'Deletar',

  // Ações específicas
  UPLOAD_FILE = 'Upload de Arquivo',
  DOWNLOAD_FILE = 'Download de Arquivo',
  PROCESS_ORDER = 'Processar Pedido',
  CANCEL_ORDER = 'Cancelar Pedido',
}

export enum ResultEnum {
  SUCCESS = 'Sucesso',
  INVALID_CREDENTIALS = 'Credenciais inválidas',
  USER_INACTIVE = 'Usuário inativo',
  UNAUTHORIZED = 'Não autorizado',
  NOT_FOUND = 'Não encontrado',
  BAD_REQUEST = 'Requisição inválida',
  CONFLICT = 'Conflito',
  INTERNAL_SERVER_ERROR = 'Erro interno do servidor',
  TOKEN_EXPIRED = 'Token expirado',
  INVALID_TOKEN = 'Token inválido',
  UNHANDLED_ERROR = 'Erro não tratado',
}

/**
 * Tipos de erros que podem ser salvos em errorData dos logs
 * Inclui: stack trace, tipo de erro, status HTTP, response completa, timestamp
 */
export interface LogErrorData {
  type: string;
  message: string;
  stack?: string;
  statusCode?: number;
  response?: Record<string, unknown>;
  timestamp: string;
  [key: string]: unknown;
}

