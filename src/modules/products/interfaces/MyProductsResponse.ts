import { InReviewEnum, publishedEnum } from '../typeorm/entities/Product';

export default interface iProductRecommendResponse {
  id: string;
  title: string;
  url: string;
  avatar: string;
  price: number;
  description?: string;
  created_at: Date;
  published: publishedEnum;
  in_review: InReviewEnum;
  classification?: number;
  store: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    title: string;
  };
}
