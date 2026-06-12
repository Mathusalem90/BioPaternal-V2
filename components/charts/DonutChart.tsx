'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DonutChartProps {
  exclusions: number
  compatibilities: number
}

export default function DonutChart({ exclusions, compatibilities }: DonutChartProps) {
  const total = exclusions + compatibilities

  const data = {
    labels: ['Exclusion', 'Compatibilité'],
    datasets: [
      {
        data: total === 0 ? [1, 1] : [exclusions, compatibilities],
        backgroundColor:
          total === 0
            ? ['rgba(37,54,82,0.6)', 'rgba(37,54,82,0.3)']
            : ['rgba(239,68,68,0.85)', 'rgba(148,163,184,0.7)'],
        borderColor:
          total === 0
            ? ['rgba(37,54,82,0.8)', 'rgba(37,54,82,0.5)']
            : ['rgb(220,38,38)', 'rgb(100,116,139)'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8B9DB5',
          font: { family: 'var(--font-body)', size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111E35',
        borderColor: '#253652',
        borderWidth: 1,
        titleColor: '#EEE9DE',
        bodyColor: '#8B9DB5',
        padding: 10,
        callbacks: {
          label(ctx) {
            if (total === 0) return ' Aucune donnée'
            const pct = ((ctx.parsed / total) * 100).toFixed(1)
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`
          },
        },
      },
    },
    animation: { animateRotate: true, duration: 800 },
  }

  return (
    <div className="relative flex items-center justify-center" style={{ height: 220 }}>
      <Doughnut data={data} options={options} />
      {total > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -mt-5">
            <div className="font-display text-3xl font-light text-ivory-200">{total}</div>
            <div className="text-[10px] text-slate2-500 tracking-widest uppercase">tests</div>
          </div>
        </div>
      )}
    </div>
  )
}
