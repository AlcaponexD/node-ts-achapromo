export interface product {
  id: string;
  title: string;
  url: string;
  avatar: string;
  price: number;
  discount_percentage?: number;
  description: string;
  classification: number;
  created_at: Date;
  comments_count?: number;
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

export interface iProductListResponse {
  products: product[];
  total: number;
  next_page: boolean;
}
