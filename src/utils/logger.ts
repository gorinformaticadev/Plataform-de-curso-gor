import { NextRequest } from 'next/server';

interface LogData {
  method?: string;
  path?: string;
  userAgent?: string;
  timestamp: string;
  action: string;
  details?: any;
}

class Logger {
  private static instance: Logger;
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(action: string, details?: any, request?: NextRequest) {
    const logData: LogData = {
      method: request?.method,
      path: request?.nextUrl?.pathname,
      userAgent: request?.headers.get('user-agent') || undefined,
      timestamp: new Date().toISOString(),
      action,
      details
    };

    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      console.log('[LOG]', JSON.stringify(logData));
    } else {
      console.log(`[${logData.timestamp}] ${action}:`, details);
    }
  }

  error(action: string, error: any, request?: NextRequest) {
    const logData: LogData = {
      method: request?.method,
      path: request?.nextUrl?.pathname,
      userAgent: request?.headers.get('user-agent') || undefined,
      timestamp: new Date().toISOString(),
      action,
      details: { error: error.message || error }
    };

    console.error('[ERROR]', JSON.stringify(logData));
  }
}

export const logger = Logger.getInstance();
