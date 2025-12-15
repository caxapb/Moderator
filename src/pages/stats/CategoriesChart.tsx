// ========================================================================================
// Компонент с графиком распределения категорий, бар чарт
// ========================================================================================

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

import type { Chart as ChartJS } from "chart.js/auto";
import type { CategoriesDataModel } from "../../models/StatsModel";

export default function ChartCategories({ data } : { data: CategoriesDataModel }) {
  // данные уже были загружены в родительском компоненте, поэтому передаем их
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  // отрисовка графика в canvas
  // за основу были взяты графики с https://www.w3schools.com/ai/ai_chartjs.asp, однако помогали нейросети
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    
    const labels = Object.keys(data); 
    const values = Object.values(data);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Количество объявлений",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
