import { iProductListResponse } from './ProductListResponse';

export default interface iProductSearchListResponse {
  next_page: boolean;
  products: iProductListResponse[];
  total: number;
}
