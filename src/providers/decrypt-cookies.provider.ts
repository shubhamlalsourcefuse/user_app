import {Provider, ValueOrPromise} from '@loopback/core';
import crypto from 'crypto';

export class DecryptCookieProvider implements Provider<DecryptCookieFn>{
  value(): ValueOrPromise<DecryptCookieFn> {
    return (cookie: string | undefined) => {
      if (!cookie) {
        return undefined;
      }
      return this.decryptCookie(cookie);
    }
  }
  decryptCookie(cookie: string) {
    const encryptedCookie = cookie.split('=')[1];
    const [ivHex, encryptedValue] = encryptedCookie.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = process.env.COOKIE_KEY as string;
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedValue = decipher.update(encryptedValue, 'hex', 'utf8');
    decryptedValue += decipher.final('utf8');
    return decryptedValue;
  }
}

export type DecryptCookieFn = (cookie: string | undefined) => string | undefined | Error;
