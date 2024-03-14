import Product from '../../../products/typeorm/entities/Product';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum isAdminEnum {
  Option1 = 'no',
  Option2 = 'yes',
}

@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: true })
  password: string;

  @Column()
  avatar: string;

  @Column({
    type: 'enum',
    enum: isAdminEnum,
    default: isAdminEnum.Option1,
  })
  is_admin: isAdminEnum;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Product, product => product.user)
  @JoinColumn()
  products: Product[];
}

export default User;
