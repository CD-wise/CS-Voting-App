"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryPieChartProps {
  categoryName: string
  data: Array<{
    name: string
    value: number
    position: number
  }>
  colors: string[]
}

export default function CategoryPieChart({ categoryName, data, colors }: CategoryPieChartProps) {
  // Prepare data with colors
  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }))

  const totalVotes = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = totalVotes > 0 ? Math.round((data.value / totalVotes) * 100) : 0
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} votes ({percentage}%)
          </p>
          <p className="text-xs text-gray-500">Position: {data.position}</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if percentage is greater than 5%
    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${value}`}
      </text>
    )
  }

  return (
    <Card className="h-full min-w-[350px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{categoryName}</CardTitle>
        <CardDescription className="text-sm">
          Total votes: <span className="font-medium">{totalVotes}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Enhanced Legend */}
        <div className="mt-4 space-y-2">
          {chartData.map((entry, index) => {
            const percentage = totalVotes > 0 ? Math.round((entry.value / totalVotes) * 100) : 0
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill }} />
                  <span className="font-medium truncate">{entry.name}</span>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-gray-600 font-medium">{entry.value}</span>
                  <span className="text-gray-500 text-xs">({percentage}%)</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.position === 1
                        ? "bg-green-100 text-green-800"
                        : entry.position === 2
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    #{entry.position}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
