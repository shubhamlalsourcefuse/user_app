import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {AuthenticationComponent, Strategies} from 'loopback4-authentication';
import {AuthorizationBindings, AuthorizationComponent} from "loopback4-authorization";
import path from 'path';
import LoggerComponent from './component/logger';
import {DecryptCookieProvider} from './providers/decrypt-cookies.provider';
import {JWTTokenProvider} from './providers/jwt-token.provider';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class UserAppApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));
    this.migrateSchema();
    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.bind('DecryptCookie').toProvider(DecryptCookieProvider)

    this.component(RestExplorerComponent);

    // Adding custome component;

    this.component(LoggerComponent);

    this.component(AuthenticationComponent);
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer'],
    });
    this.component(AuthorizationComponent);

    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(JWTTokenProvider);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
