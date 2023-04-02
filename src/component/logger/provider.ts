import {Provider, ValueOrPromise} from '@loopback/core';
import winston from 'winston';
import {WinstonConfigOption} from './config';
import {LoggerFunction, LogType} from './utils';

export class LoggerProvider implements Provider<LoggerFunction> {
  winstone: winston.Logger;

  constructor() {
    this.winstone = winston.createLogger(WinstonConfigOption);
  }

  value(): ValueOrPromise<LoggerFunction> {
    return (level: string, message: string) => {
      // custome Logic
      switch (level) {
        case LogType.INFO: this.winstone.info(message);
          break;
        case LogType.ERROR: this.winstone.error(message);
          break;
        default: this.winstone.warn(message);
      }
    }
  }
}
