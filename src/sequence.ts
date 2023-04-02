import {inject} from '@loopback/core';
import {
  FindRoute,
  HttpErrors,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceActions,
  SequenceHandler
} from '@loopback/rest';
import * as dotenv from 'dotenv';
import Jwt from 'jsonwebtoken';
import {LoggerFunction, LOGGER_BINDS, LogType} from './component/logger/utils';
import {DecryptCookieFn} from './providers/decrypt-cookies.provider';
dotenv.config();

export class MySequence implements SequenceHandler {
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => true;

  constructor(
    @inject(SequenceActions.FIND_ROUTE)
    protected findRoute: FindRoute,
    @inject(RestBindings.SequenceActions.INVOKE_METHOD)
    protected invoke: InvokeMethod,
    @inject(RestBindings.SequenceActions.PARSE_PARAMS)
    protected parseParams: ParseParams,
    @inject(RestBindings.SequenceActions.SEND)
    public send: Send,
    @inject(RestBindings.SequenceActions.REJECT)
    public reject: Reject,
    @inject(LOGGER_BINDS)
    public logger: LoggerFunction,
    @inject('DecryptCookie')
    public decryptCookie: DecryptCookieFn
  ) { }

  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      if (
        !request.headers.host?.includes(
          process.env.ALLOWED_ORIGIN as string,
        )
      ) {
        throw new HttpErrors.Forbidden('INVALID ORIGIN');
      }
      this.startingRequestLog(context);
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      const cookieDetails = this.decryptCookie(context.request.headers.cookie);
      if (cookieDetails) {
        const token = Jwt.sign({userId: cookieDetails}, process.env.JWT_KEY as string);
        context.request.headers.authorization = `Bearer ${token}`;
        console.log(token);
      }
      this.requestEndLog();
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }

  private log(message: string, level: string) {
    this.logger(level ?? LogType.INFO, message);
  }

  startingRequestLog(context: RequestContext) {
    const {request: {headers}} = context;
    this.log(`Request started on ${new Date()}`, LogType.INFO)
    this.log(`Referer: ${headers.referer}`, LogType.INFO)
    this.log(`User-Agent: ${headers.userAgent}`, LogType.INFO)
    this.log(`Request IP: ${headers.ip}`, LogType.INFO)
  }

  requestEndLog() {
    this.log(`Request completed on ${new Date()}`, LogType.INFO)

  }

}
