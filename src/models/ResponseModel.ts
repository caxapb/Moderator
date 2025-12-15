import type { AdModel } from "./AdsModels";
import type { PaginationModel } from "./PaginationModel";

export interface BadRequestModel {
  // 400
  error: string;
  message: string;
}

export interface NotFoundModel {
  // 404
  error: string;
  id: number;
}

export interface InternalServerErrorModel {
  // 500
  error: string;
  message: string;
}

export interface AdsResponseModel {
  ads: AdModel[];
  pagination: PaginationModel;
}

export interface CreateAdResponseModel {
  message: string;
  ad: AdModel;
}
