import { publishedEnum } from '../typeorm/entities/Comment';

export default interface IRequest {
  product_id: string;
  content: string;
  user_id: string;
  published: publishedEnum;
}
