
import {Provider, ValueOrPromise} from "@loopback/core";
import Jwt from 'jsonwebtoken';
import {IAuthUser, VerifyFunction} from "loopback4-authentication";
import {User} from '../models';

export class JWTTokenProvider implements Provider<VerifyFunction.BearerFn<IAuthUser>>{

  constructor() { }

  value(): ValueOrPromise<VerifyFunction.BearerFn<IAuthUser>> {
    return async (token) => {
      return await Jwt.verify(token, process.env.JWT_SECRET as string) as User
    }
  }

}
