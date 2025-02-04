interface comments {
  id: string;
}

interface histories {
  id: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

interface product {
  id: string;
  title: string;
  url: string;
  avatar: string;
  price: number;
  description?: string;
  created_at: Date;
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
  comments?: comments[];
  histories?: histories[];
}

interface iProductListResponse {
  products: product[];
  total: number;
  next_page: boolean;
}

export { iProductListResponse, product };
