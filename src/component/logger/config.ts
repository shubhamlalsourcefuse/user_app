import winston from 'winston'
export const WinstonConfigOption: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: '/log/error.log', level: 'error'}),
    new winston.transports.File({filename: '/log/warning.log', level: 'warning'})
  ],

}
