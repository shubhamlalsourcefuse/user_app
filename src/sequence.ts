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
import {AuthenticateFn, AuthenticationBindings} from "loopback4-authentication";
import {AuthorizationBindings, AuthorizeErrorKeys, AuthorizeFn, UserPermissionsFn} from "loopback4-authorization";
import {LOGGER_BINDS, LogType, LoggerFunction} from './component/logger/utils';
import {User} from './models';
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
    public decryptCookie: DecryptCookieFn,
    @inject(AuthenticationBindings.USER_AUTH_ACTION)
    private AuthenticateAction: AuthenticateFn<User>,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    private getPermission: UserPermissionsFn<string>,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    private checkAuthorisation: AuthorizeFn
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
      const AuthenticatedUser: User = await this.AuthenticateAction(request);

      //get the permission from Authenticated User;
      const permissions = this.getPermission(AuthenticatedUser.permissions, AuthenticatedUser.role.permissions);

      const isAccessAllowed: boolean = await this.checkAuthorisation(
        permissions, // do authUser.permissions if using method #1
        request,
      );

      if (!isAccessAllowed) {
        throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
      }

      const result = await this.invoke(route, args);
      // const cookieDetails = this.decryptCookie(context.request.headers.cookie);
      // if (cookieDetails) {
      //   const token = Jwt.sign({userId: cookieDetails}, process.env.JWT_KEY as string);
      //   context.request.headers.authorization = `Bearer ${token}`;
      //   console.log(token);
      // }
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
