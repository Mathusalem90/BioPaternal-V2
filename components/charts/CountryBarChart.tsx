'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface CountryData {
  country: string
  tests: number
  exclusions: number
  compatibilities: number
}

interface CountryBarChartProps {
  data: CountryData[]
}

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  BJ: 'Bénin',
  TG: 'Togo',
  CI: "Côte d'Ivoire",
  SN: 'Sénégal',
  ML: 'Mali',
  BF: 'Burkina Faso',
  CM: 'Cameroun',
  CD: 'Congo RDC',
  GA: 'Gabon',
  NE: 'Niger',
  GH: 'Ghana',
  NG: 'Nigeria',
  US: 'États-Unis',
  GB: 'Royaume-Uni',
  BE: 'Belgique',
  CA: 'Canada',
  DE: 'Allemagne',
  IT: 'Italie',
  ES: 'Espagne',
}

export default function CountryBarChart({ data }: CountryBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-slate2-600 text-xs">
        Aucune donnée disponible
      </div>
    )
  }

  const labels = data.map(
    (d) => COUNTRY_NAMES[d.country] ?? d.country
  )

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Exclusion',
        data: data.map((d) => d.exclusions),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: 'rgb(220,38,38)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Compatibilité',
        data: data.map((d) => d.compatibilities),
        backgroundColor: 'rgba(148,163,184,0.55)',
        borderColor: 'rgb(100,116,139)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#6B7E96',
          font: { family: 'var(--font-body)', size: 10 },
          maxRotation: 35,
        },
        grid: { color: 'rgba(37,54,82,0.4)' },
        border: { color: 'rgba(37,54,82,0.6)' },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          color: '#6B7E96',
          font: { family: 'var(--font-body)', size: 10 },
          stepSize: 1,
        },
        grid: { color: 'rgba(37,54,82,0.4)' },
        border: { color: 'rgba(37,54,82,0.6)' },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8B9DB5',
          font: { family: 'var(--font-body)', size: 11 },
          padding: 14,
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
      },
    },
    animation: { duration: 700 },
  }

  return (
    <div style={{ height: 220, position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
