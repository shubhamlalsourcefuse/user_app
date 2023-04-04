import {Entity, hasOne, model, property} from '@loopback/repository';
import {IAuthUser} from "loopback4-authentication";
import {Customer} from './customer.model';
import {Role} from './role.model';

@model()
export class User extends Entity implements IAuthUser {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true
  })
  username: string
  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'number',
  })
  phone?: number;

  @property({
    type: 'string',
  })
  created?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @hasOne(() => Role)
  role: Role;

  @hasOne(() => Customer)
  customer: Customer;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
