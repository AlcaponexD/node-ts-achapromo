interface Iquery {
  page: number;
  per_page: number;
  from?: number;
  to?: number;
  search?: string;
}

export default Iquery;
