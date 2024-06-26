import Product from '../../../products/typeorm/entities/Product';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
export enum publishedEnum {
  Option1 = '0',
  Option2 = '1',
}
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: publishedEnum,
    default: publishedEnum.Option1,
  })
  published: publishedEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @OneToMany(() => Product, product => product.store)
  @JoinColumn()
  products: Product[];
}
