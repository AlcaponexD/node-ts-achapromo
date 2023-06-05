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

export enum publishedEnum {
  Option1 = '0',
  Option2 = '1',
}

@Entity('stores')
class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  avatar: string;

  @Column()
  url: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: publishedEnum,
    default: publishedEnum.Option1,
  })
  published: publishedEnum;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Product, product => product.store)
  @JoinColumn()
  products: Product[];
}

export default Store;
