// ========================================================================================
// Компонент для статистики. Собирает в себе страницу из более мелких компонентов-чартов
// Получает данные с сервера, формирует элементы сам или передает данные в компоненты дальше
// Включает в себя фильтр по периоду: сегодня/неделя/месяц, в зависимости от периода формирует
// запросы на сервер
// ========================================================================================

import { useState, useEffect } from 'react';
import ChartCategories from './CategoriesChart';
import DecisionsChart from './DecisionChart';
import ActivityBarChart from './ActivityChart';
import fetchData from '../../utils/fetchData';
import './Stats.css'

import type { StatsSummaryModel, DecisionsDataModel, CategoriesDataModel } from '../../models/StatsModel';
import { defaultStatsSummary, defaultCategoriesData, defaultDecisionsData } from '../../models/StatsModel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Stats() {
  const [stats, setStats] = useState<StatsSummaryModel>(defaultStatsSummary);
  const [decisions, setDecisions] = useState<DecisionsDataModel>(defaultDecisionsData);
  const [categories, setCategories] = useState<CategoriesDataModel>(defaultCategoriesData);
  // Запрос по активности будет отдельно в компоненте ActivityChart, так как будет 2 графика для разных периодов
  // Чтобы не перегружать этот компнент, вынесено в отдельный
  const [period, setPeriod] = useState<string>('today');

  // запросы к серверу с указанием выбранного периода
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const summaryData = await fetchData<StatsSummaryModel>(`${API_URL}/api/v1/stats/summary?period=${period}`);
        setStats(summaryData);
        const decisionsData = await fetchData<DecisionsDataModel>(`${API_URL}/api/v1/stats/chart/decisions?period=${period}`);
        setDecisions(decisionsData);
        const categoriesData = await fetchData<CategoriesDataModel>(`${API_URL}/api/v1/stats/chart/categories?period=${period}`);
        setCategories(categoriesData);
      } catch (err) {
        if (err instanceof TypeError) {
          console.error("Сетевая ошибка:", err.message);
        } else {
          const error = err as Error;
          console.error("Ошибка при загрузке статистики:", error.message);
        }
      }
    }
    fetchStatsData();
  }, [period]);

  return (
    <div className="stats-page">
      <h1>Статистика модератора</h1>

      <div className="period-container">
        Период:
        <button className={period === 'today' ? 'active' : ''}
          onClick={() => setPeriod('today')}> Сегодня </button>
        <button className={period === 'week' ? 'active' : ''}
          onClick={() => setPeriod('week')}> Неделя </button>
        <button className={period === 'month' ? 'active' : ''}
          onClick={() => setPeriod('month')}> Месяц </button>
      </div>

      <div className='simple-stats'>
        <p>Всего проверено: <br />{stats.totalReviewedToday ?? 0}</p>
        <p>Одобренных: <br />{Math.round(stats.approvedPercentage ?? 0)}%</p>
        <p>Отклоненных: <br />{Math.round(stats.rejectedPercentage ?? 0)}%</p>
        <p>Среднее время: <br />{stats.averageReviewTime ?? 0} мин</p>
      </div>

      <div className='charts'>
        <h3>Графики активности</h3>
        <h4>Столбчатые диаграммы активности</h4>
        <div className='activity-charts'>
          <ActivityBarChart period="week"/>
          <ActivityBarChart period="month" />
        </div>
        
        <h4>Круговая диаграмма распределения решений </h4>
        <DecisionsChart data={decisions} />

        <h4>График по категориям проверенных объявлений </h4>
        <div className='categories-chart'>
          <ChartCategories data={categories} />
        </div>
      </div>
    </div>
  );
}
