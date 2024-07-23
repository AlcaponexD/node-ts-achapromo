import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Product from './Product';

@Entity('product_histories')
class ProductHistory {
  @PrimaryColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  product_id: string;

  @OneToOne(() => Product, { primary: true, cascade: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default ProductHistory;
