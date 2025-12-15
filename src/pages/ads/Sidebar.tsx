// ========================================================================================
// Компонент боковой панели
// Панель не движется со скролингом списка объявлений, содержит в себе фильтры по категориям,
// статусам, цене
// Функции-обработчики (toggle...()) вызываются при изменении полей ввода (селекторы, инпуты) модератором,
// работают с состояниями для синхронного изменения
// ========================================================================================

import './styles/Sidebar.css'
import type { FiltersModel } from '../../models/FiltersModel';
import { defaultFilters } from '../../models/FiltersModel';
import { CATEGORIES } from '../../models/AdsModels';

const statuses = ['pending', 'approved', 'rejected'];
const categories = Object.values(CATEGORIES);

export default function Sidebar({ filters, onChangeFilters, isSidebarOpen, }: {
  filters: FiltersModel;
  onChangeFilters: (patch: Partial<FiltersModel>) => void;
  isSidebarOpen: boolean;
}) {
  const { statuses: selectedStatuses, categoryId, minPrice, maxPrice } = filters;

  // обработчики статуса и категории
  const toggleStatus = (status: string) => {
    const newStatusesSet = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onChangeFilters({ statuses: newStatusesSet });
  };

  const toggleCategory = (cat: CATEGORIES) => {
    const id = String(categories.indexOf(cat));
    // если повторно нажали на ту же снимаем выбор
    onChangeFilters({
      categoryId: categoryId === id ? '' : id
    });
  };

  // сброс всех фильтров
  const drop = () => {
    onChangeFilters(defaultFilters);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

      <h3>Статус</h3>
      {statuses.map((status) => (
        <label key={status} >
          <input
            type="checkbox"
            checked={selectedStatuses.includes(status)}
            onChange={() => toggleStatus(status)}
          />
          {status === "pending" ? "На доработке" : status === "rejected" ? "Отклонено" : 
          status === "approved" ? "Одобрено" : "Черновик"} <br />
        </label>
      ))}

      <h3>Категория</h3>
        {categories.map((cat, idx) => (
          <label key={cat} >
            <input
              type="checkbox"
              checked={categoryId !== '' && Number(categoryId) === idx}
              onChange={() => toggleCategory(cat)}
            />
            {cat} <br />
          </label>
        ))}

      <h3>Цена</h3>
        <input className='text-input'
          type="number"
          placeholder="от"
          value={minPrice}
          onChange={e => onChangeFilters({ minPrice: e.target.value })}
        />
        <input className='text-input'
            type="number"
            placeholder="до"
            value={maxPrice}
            onChange={e => onChangeFilters({ maxPrice: e.target.value })}
        />

      <button type="button" onClick={drop}> Сбросить </button>
    </div>
  );
}
