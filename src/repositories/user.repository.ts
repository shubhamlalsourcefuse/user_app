import {Getter, inject} from '@loopback/core';
import {HasOneRepositoryFactory, repository} from '@loopback/repository';
import {SoftCrudRepository} from "loopback4-soft-delete";
import {PgdatasourceDataSource} from '../datasources';
import {Customer, Role, User, UserRelations} from '../models';
import {CustomerRepository} from './customer.repository';
import {RoleRepository} from './role.repository';
export class UserRepository extends SoftCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly role: HasOneRepositoryFactory<Role, typeof User.prototype.id>;

  public readonly customer: HasOneRepositoryFactory<Customer, typeof User.prototype.id>;

  constructor(
    @inject('datasources.pgdatasource') dataSource: PgdatasourceDataSource, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(User, dataSource);
    this.customer = this.createHasOneRepositoryFactoryFor('customer', customerRepositoryGetter);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.role = this.createHasOneRepositoryFactoryFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }
}
