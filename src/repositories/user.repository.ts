import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {PgdatasourceDataSource} from '../datasources';
import {User, UserRelations, Role, Customer} from '../models';
import {RoleRepository} from './role.repository';
import {CustomerRepository} from './customer.repository';

export class UserRepository extends DefaultCrudRepository<
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
