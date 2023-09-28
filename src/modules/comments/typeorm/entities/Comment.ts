import Product from '@modules/products/typeorm/entities/Product';
import User from '../../../users/typeorm/entities/User';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum publishedEnum {
  Option1 = '0',
  Option2 = '1',
}

@Entity('comments')
class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, { primary: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  product_id: string;

  @OneToOne(() => Product, { primary: true, cascade: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    type: 'enum',
    enum: publishedEnum,
    default: publishedEnum.Option2,
  })
  published: publishedEnum;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Comment;
