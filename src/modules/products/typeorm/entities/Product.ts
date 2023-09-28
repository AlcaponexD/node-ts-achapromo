import { Category } from '../../../categories/typeorm/entities/Category';
import Store from '../../../stores/typeorm/entities/Store';
import User from '../../../users/typeorm/entities/User';
import Comment from '../../../comments/typeorm/entities/Comment';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum publishedEnum {
  Option1 = '0',
  Option2 = '1',
}

export enum InReviewEnum {
  Option1 = '0',
  Option2 = '1',
}

@Entity('products')
class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  avatar: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  store_id: string;

  @Column()
  classification: number;

  @OneToOne(() => User, { primary: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Store, store => store.products)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Comment, comment => comment.product)
  @JoinColumn()
  comments: Comment[];

  @Column({
    type: 'enum',
    enum: publishedEnum,
    default: publishedEnum.Option1,
  })
  published: publishedEnum;

  @Column({
    type: 'enum',
    enum: InReviewEnum,
    default: InReviewEnum.Option1,
  })
  in_review: InReviewEnum;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Product;
