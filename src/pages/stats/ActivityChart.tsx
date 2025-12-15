// ========================================================================================
// Компонент, создающий график активности
// Формируется график на основе переданного периода, график демонстрирует как много объявлений
// было обработано (Отклонено/Одобрено/На редактирование) модератором каждый день в течение
// указанного периода
// В основном компоненте статистики этот компонент отрисовывается дважды (период=неделя и период=месяц)
// ========================================================================================

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { defaultActivityData } from "../../models/StatsModel";

import type { Chart as ChartJS } from "chart.js/auto";
import type { ActivityDataModel } from "../../models/StatsModel";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ActivityBarChart({ period }: {period: "week" | "month"}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [data, setData] = useState<ActivityDataModel[]>([defaultActivityData]);

  // в Stats.jsx не было запроса к активности, он происходит здесь 
  useEffect(() => {
    fetch(`${API_URL}/api/v1/stats/chart/activity?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data || []);
      })
  }, [period]);

  // отрисовка графика в canvas
  // за основу были взяты графики с https://www.w3schools.com/ai/ai_chartjs.asp, однако помогали нейросети
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.map((item) => {
      const d = item.date;
      return d ? `${d.slice(8, 10)}.${d.slice(5, 7)}` : "";
    });

    const approved = data.map((item) => item.approved || 0);
    const rejected = data.map((item) => item.rejected || 0);
    const requestChanges = data.map((item) => item.requestChanges || 0);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Одобрено",
            data: approved,
            backgroundColor: "green",
          },
          {
            label: "Отклонено",
            data: rejected,
            backgroundColor: "red",
          },
          {
            label: "На доработку",
            data: requestChanges,
            backgroundColor: "orange",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text:period === "week" ? "Активность за последнюю неделю" : "Активность за последний месяц",
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, period]);

  return (
    <div >
      <canvas ref={canvasRef} />
    </div>
  );
}
