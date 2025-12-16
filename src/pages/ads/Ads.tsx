// ========================================================================================
// Компонент, формирующий главную страницу.
// На странице изображен сайдбар по левую сторону, хедер и список объявлений, разбитый пагинацией
// Из полей, измененных модератором, берутся значения и формируется строка запроса к серверу
// Возвращается подходящий список объявлений и информация о пагинации
// ========================================================================================


import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdPreview from '../../components/AdPreview';
import fetchData from '../../utils/fetchData';
import AdsHeader from './AdsHeader';
import Pagination from './Pagination';
import NewAd from './NewAd';

// импорт типов
import type { AdModel } from '../../models/AdsModels';
import type { AdsResponseModel } from '../../models/ResponseModel';
import type { FiltersModel } from '../../models/FiltersModel';
import type { AdsHeaderProps } from './AdsHeader';

// импорт из redux store
import { useAppDispatch,  useAppSelector} from '../../store/hooks';
import { setAds, setFilters, setSortBy, setSortOrder, setPagination,
  setItemsPerPage, setCurrentPage, toggleSelected, selectAll,
} from '../../store/adsSlice';

// импорт стилей
import './styles/Ads.css'

const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Ads() {
  const { ads, filters, sortBy, sortOrder, pagination, selectedIds, allAreChosen,} = useAppSelector((state) => state.ads);
  const dispatch = useAppDispatch();

  // поиск через параметры url
  const [searchParams] = useSearchParams();
  const search: string = searchParams.get('search') || '';

  // трекаем должен ли сайдбар быть открыт (для адаптивности)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // трекаем должно ли окно о создании нового объявления быть октрытым
  const [showNewAd, setShowNewAd] = useState<boolean>(false);

  // загрузка
  const [loading, setLoading] = useState<boolean>(true);

  const toggleSelection = (id: number) => {
    dispatch(toggleSelected(id));
  };
  const handleSelectAll = () => {
    dispatch(selectAll());
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
        dispatch(setAds(data.ads));
        dispatch(setPagination(data.pagination));
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

  }, [filters, search, sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage, dispatch]);

  if (loading) return <div>Загрузка объявлений</div>;

  // функция для перехода к новой странице
  // проверка на валидность номера страницы
  const goTo = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return;
    dispatch(setCurrentPage(p));
  };

  // обработка настройки количества объявлений на странице
  // проверка чисел
  // значение берется из инпута (при изменении)
  const changeLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      dispatch(setItemsPerPage(10));
      return;
    }
    let value = +raw;
    if (Number.isNaN(value)) return;
    if (value < 1) value = 1;
    if (value > 100) value = 100;

    dispatch(setItemsPerPage(value));
  };

  const sidebarParams = {
    filters,
    onChangeFilters: (patch: Partial<FiltersModel>) => {
      dispatch(setFilters(patch));
    },
    isSidebarOpen,
  };

  const adsHeaderParams = {
    sortBy: sortBy, 
    setSortBy: (value: 'createdAt' | 'price' | 'priority' | '') => dispatch(setSortBy(value)),
    sortOrder: sortOrder, 
    setSortOrder: (value: 'asc' |'desc' | '') => dispatch(setSortOrder(value)),
    limit: pagination.itemsPerPage, 
    changeLimit: changeLimit,
    selectedIds: selectedIds,
    allAreChosen: allAreChosen,
    selectAll: handleSelectAll,
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
  // кнопка для добавления нового объявления от имени модератора
  return (
    <>
    <div className='main-page'>
      <button className="sidebar-toggle-btn" onClick={() => {setIsSidebarOpen(!isSidebarOpen)}}>
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
            onCreated={(ad: AdModel) => dispatch(setAds([ad, ...ads]))}
            onClose={() => setShowNewAd(false)}
          />
        )}
      </div>
    </div>
    </>
  );
}
