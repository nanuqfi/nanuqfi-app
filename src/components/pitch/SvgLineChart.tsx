interface ChartLine {
  data: number[]
  color: string
  dashed?: boolean
  label: string
}

interface SvgLineChartProps {
  lines: ChartLine[]
  labels: string[]
  height?: number
  className?: string
}

const CHART_WIDTH = 800
const CHART_HEIGHT = 280
const MARGIN = { top: 10, right: 10, bottom: 30, left: 50 }

function formatLabel(date: string): string {
  const parts = date.split('-')
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${month[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`
}

export function SvgLineChart({
  lines,
  labels,
  height = 320,
  className = '',
}: SvgLineChartProps) {
  const dataLength = labels.length
  if (dataLength === 0) return null

  const allValues = lines.flatMap((l) => l.data)
  const yMin = Math.min(...allValues)
  const yMax = Math.max(...allValues)
  const yRange = yMax - yMin || 1
  const yPad = yRange * 0.1

  const plotLeft = MARGIN.left
  const plotRight = CHART_WIDTH - MARGIN.right
  const plotTop = MARGIN.top
  const plotBottom = MARGIN.top + CHART_HEIGHT
  const plotWidth = plotRight - plotLeft
  const plotHeight = plotBottom - plotTop

  const scaledYMin = yMin - yPad
  const scaledYMax = yMax + yPad
  const scaledYRange = scaledYMax - scaledYMin

  const xScale = (i: number) =>
    plotLeft + (i / (dataLength - 1)) * plotWidth

  const yScale = (v: number) =>
    plotTop + plotHeight - ((v - scaledYMin) / scaledYRange) * plotHeight

  // Gridlines: 5 evenly spaced values
  const gridCount = 5
  const gridValues: number[] = []
  for (let i = 0; i < gridCount; i++) {
    gridValues.push(scaledYMin + (scaledYRange * i) / (gridCount - 1))
  }

  // X-axis labels: show every ~15th to avoid crowding
  const xLabelStep = Math.max(1, Math.round(dataLength / 6))

  // Build path strings
  const paths = lines.map((line) => {
    const points = line.data
      .map((v, i) => `${xScale(i).toFixed(2)},${yScale(v).toFixed(2)}`)
    return `M ${points.join(' L ')}`
  })

  const viewBoxWidth = CHART_WIDTH
  const viewBoxHeight = CHART_HEIGHT + MARGIN.top + MARGIN.bottom

  return (
    <div className={className}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gridlines + Y-axis labels */}
        {gridValues.map((val) => {
          const y = yScale(val)
          return (
            <g key={val}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke="#1e293b"
                strokeWidth="0.5"
              />
              <text
                x={plotLeft - 6}
                y={y + 3.5}
                textAnchor="end"
                className="fill-slate-500"
                fontSize="10"
              >
                {val.toFixed(1)}%
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          if (i % xLabelStep !== 0 && i !== dataLength - 1) return null
          return (
            <text
              key={i}
              x={xScale(i)}
              y={plotBottom + 18}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="10"
            >
              {formatLabel(label)}
            </text>
          )
        })}

        {/* Data lines */}
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={lines[i].color}
            strokeWidth="2"
            strokeDasharray={lines[i].dashed ? '6 4' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        {lines.map((line) => (
          <span key={line.label} className="flex items-center gap-2 text-sm text-slate-400">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            {line.label}
          </span>
        ))}
      </div>
    </div>
  )
}
