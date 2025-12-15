// ========================================================================================
// Компонент, формирующий главную страницу.
// На странице изображен сайдбар по левую сторону, хедер и список объявлений, разбитый пагинацией
// Из полей, измененных модератором, берутся значения и формируется строка запроса к серверу
// Возвращается подходящий список объявлений и информация о пагинации
// ========================================================================================


import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import AdPreview from '../../components/AdPreview';
import fetchData from '../../utils/fetchData';
import { useSearchParams } from 'react-router-dom';
import AdsHeader from './AdsHeader';
import Pagination from './Pagination';
import NewAd from './NewAd';
import { defaultPagination } from '../../models/PaginationModel';
import { defaultFilters } from '../../models/FiltersModel';

// импорт типов
import type { AdModel } from '../../models/AdsModels';
import type { PaginationModel } from '../../models/PaginationModel';
import type { AdsResponseModel } from '../../models/ResponseModel';
import type { FiltersModel } from '../../models/FiltersModel';
import type { AdsHeaderProps } from './AdsHeader';

import './styles/Ads.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Ads() {
  // данные по объявлениям
  const [ads, setAds] = useState<AdModel[]>([]);

  // данные по пагинации
  const [pagination, setPagination] = useState<PaginationModel>(defaultPagination);

  // выбранные фильтры и параметр сортировки
  const [filters, setFilters] = useState<FiltersModel>(defaultFilters);
  const [sortOrder, setSortOrder] = useState<'asc' |'desc' | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'priority' | ''>('');

  // инфо о выбранныъ объявлениях
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [allAreChosen, setAllAreChosen] = useState<boolean>(false);

  // поиск через параметры url
  const [searchParams] = useSearchParams();
  const search: string = searchParams.get('search') || '';

  // трекаем должен ли сайдбар быть открыт (для адаптивности)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // трекаем должно ли окно о создании нового объявления быть октрытым
  const [showNewAd, setShowNewAd] = useState(false);

  // загрузка
  const [loading, setLoading] = useState<boolean>(true);

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };
  const selectAll = () => {
    setSelectedIds(allAreChosen ? new Set() : new Set(ads.map(ad => ad.id)));
    setAllAreChosen(!allAreChosen);
  };

  // формирование строки запроса с фильтрами и сортировкой
  // получение ответа: сложный объект со списком объявлений и информацией о пагинации
  // сохранение индексов подходящих объявлений в localStorage для того, чтобы они были доступны на карточке товара
  // (для навигации от объявления к объявлению без перехода к списку)
  useEffect(() => {
    // во избежании излишней нагрузки сразу проверка на количество символов в поисковой строке:
    // если их меньше 3, то не делать новый запрос на сервер (return)
    if (search && search.length < 3) { return; }
    const params = new URLSearchParams();

    params.set('page', String(pagination.currentPage));
    params.set('limit', String(pagination.itemsPerPage));


    filters.statuses.forEach((status) => {
      params.append('status', status);
    });

    // строгая проверка на пустую строку, так как ID может быть 0
    filters.categoryId !== '' ? params.append('categoryId', filters.categoryId) : '';
    filters.minPrice !== '' ? params.append('minPrice', filters.minPrice) : '';
    filters.maxPrice !== '' ? params.append('maxPrice', filters.maxPrice) : '';

    if (search && search.length >= 3) {
      params.set('search', search);
    }
    if (sortBy) {
      params.set('sortBy', sortBy);
    }
    if (sortOrder) {
      params.set('sortOrder', sortOrder);
    }

    const fetchAds = async () => {
      try {
        const data = await fetchData<AdsResponseModel>(`${API_URL}/api/v1/ads?${params.toString()}`);
        setAds(data.ads);
        setPagination(data.pagination);
        localStorage.setItem('ids', JSON.stringify(data.ads.map(ad => ad.id)));
      } catch (err) {
        if (err instanceof TypeError) {
          console.error("Сетевая ошибка. TypeError:", err.message);
        } else {
          const error = err as Error;
          console.error("HTTP ошибка.", error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAds();

  }, [filters, search, sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

  if (loading) return <div>Загрузка объявлений</div>;

  // функция для перехода к новой странице
  // проверка на валидность номера страницы
  const goTo = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPagination(prev => ({
      ...prev,
      currentPage: p,
    }));
  };

  // обработка настройки количества объявлений на странице
  // проверка чисел
  // значение берется из инпута (при изменении)
  const changeLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setPagination(prev => ({
        ...prev,
        itemsPerPage: 10,
        currentPage: 1,
      }));
      return;
    }
    let value = +raw;
    if (Number.isNaN(value)) return;
    if (value < 1) value = 1;
    if (value > 100) value = 100;

    setPagination(prev => ({
      ...prev,
      itemsPerPage: value,
      currentPage: 1,
    }));
  };

  const sidebarParams = {
    filters,
    onChangeFilters: (patch: Partial<FiltersModel>) => {
      setFilters(prev => ({ ...prev, ...patch }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    },
    isSidebarOpen,
  };

  const adsHeaderParams = {
    sortBy: sortBy, 
    setSortBy: setSortBy,
    sortOrder: sortOrder, 
    setSortOrder: setSortOrder,
    limit: pagination.itemsPerPage, 
    changeLimit: changeLimit,
    selectedIds: selectedIds,
    allAreChosen: allAreChosen,
    selectAll: selectAll,
  } as AdsHeaderProps;
  const paginationParams = {
    totalItems: pagination.totalItems, 
    currentPage: pagination.currentPage, 
    totalPages: pagination.totalPages, 
    goTo,
  };

  // Порядок:
  // формирование компонента сайдбара
  // формирование полей для сортировки, обработчиков событий при их изменении и количества объявлений на страницу
  // лист объявлений
  // пагинация со страницами, общее количество объявлений
  return (
    <>
    <div className='main-page'>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <Sidebar {...sidebarParams}/>
      <div>
        <AdsHeader {...adsHeaderParams}/>
        <div className="ad-list">
          {ads.map(ad => (
            <AdPreview key={ad.id} ad={ad} isSelected={selectedIds.has(ad.id)} onToggle={() => {toggleSelection(ad.id)}} />
          ))}
          <Pagination {...paginationParams}/>
        </div>
      </div>
      <div>
        <button className="createAd-button" onClick={() => setShowNewAd(true)}>
          Добавить объявление
        </button>

        {showNewAd && (
          <NewAd
            onCreated={(ad: AdModel) => setAds((prev) => [ad, ...prev])}
            onClose={() => setShowNewAd(false)}
          />
        )}

      </div>
    </div>
    </>
  );
}
