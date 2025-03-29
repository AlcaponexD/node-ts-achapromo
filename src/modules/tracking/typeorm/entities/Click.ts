import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Product from '../../../products/typeorm/entities/Product';

@Entity('clicks')
class Click {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_id: string;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  referer: string;

  @CreateDateColumn()
  created_at: Date;
}

export default Click;
