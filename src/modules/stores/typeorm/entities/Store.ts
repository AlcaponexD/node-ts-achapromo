import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum publishedEnum {
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
  description: string;

  @Column({
    type: 'enum',
    enum: publishedEnum,
  })
  published: publishedEnum;
}

export default Store;
