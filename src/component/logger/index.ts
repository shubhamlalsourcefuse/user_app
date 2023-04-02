import {Component, ProviderMap} from '@loopback/core';
import {LoggerProvider} from './provider';
import {LOGGER_BINDS} from './utils';

export default class LoggerComponent implements Component {
  providers?: ProviderMap | undefined;
  constructor() {
    this.providers = {
      [LOGGER_BINDS.key]: LoggerProvider
    }
  }
}
