import iProductListResponse from './ProductListResponse';

export default interface iProductSearchListResponse {
  next_page: any;
  products: iProductListResponse[];
  total: number;
}
