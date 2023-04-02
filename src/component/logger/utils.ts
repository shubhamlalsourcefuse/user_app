import {BindingKey} from '@loopback/core';

export type LoggerFunction = (level: string, message: string) => void;

export const LogType = {
  INFO: 'info',
  ERROR: 'error',
  WARNING: 'warning'
}

export const LOGGER_BINDS = BindingKey.create<LoggerFunction>('logger-key');
