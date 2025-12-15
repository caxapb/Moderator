import type { ModerationHistoryModel } from "./ModerationHisroryModel";
import type { SellerModel } from "./SellerModel";

export interface AdModel {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryId: number;
  status: STATUS;
  priority: PRIORITY;
  createdAt: string;
  updatedAt: string;
  images: string[];
  seller: SellerModel;
  characteristics: CharacteristicsModel;
  moderationHistory: ModerationHistoryModel[];
} 

export enum STATUS {
  pending = "pending", 
  approved = "approved", 
  rejected = "rejected", 
};

export enum PRIORITY {
  normal = "normal", 
  urgent = "urgent",
};

export interface CharacteristicsModel {
  "Состояние": string;
  "Гарантия": string;
  "Производитель": string;
  "Модель": string;
  "Цвет": string;
}
export const defaultCharacteristics = {
  "Состояние": '',
  "Гарантия": '',
  "Производитель": '',
  "Модель": '',
  "Цвет": ''
}  

export interface CreateAdModel {
  title: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  characteristics: CharacteristicsModel;
}

export enum CATEGORIES {
  'Электроника' = 'Электроника',
  'Недвижимость' = 'Недвижимость',
  'Транспорт' = 'Транспорт', 
  'Работа' = 'Работа', 
  'Услуги' = 'Услуги', 
  'Животные' = 'Животные', 
  'Мода' = 'Мода', 
  'Детское' = 'Детское',
}