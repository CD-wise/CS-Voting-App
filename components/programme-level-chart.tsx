"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, GraduationCap } from "lucide-react"

interface ProgrammeLevelChartProps {
  programmeStats: Array<{
    programme: string
    degree_type: string
    total_students: number
    voted_students: number
    turnout_percentage: number
  }>
  levelStats: Array<{
    level: number
    degree_type: string
    total_students: number
    voted_students: number
    turnout_percentage: number
  }>
}

export default function ProgrammeLevelChart({ programmeStats, levelStats }: ProgrammeLevelChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">Total Students: {data.total_students}</p>
          <p className="text-sm text-green-600">Voted: {data.voted_students}</p>
          <p className="text-sm text-purple-600">Turnout: {data.turnout_percentage}%</p>
          <p className="text-sm text-orange-600">Degree: {data.degree_type}</p>
        </div>
      )
    }
    return null
  }

  // Group programme stats by programme and degree type
  const groupedProgrammeStats = programmeStats.reduce((acc: Record<string, any>, curr) => {
    const key = `${curr.programme} (${curr.degree_type})`
    acc[key] = curr
    return acc
  }, {})

  // Group level stats by level and degree type
  const groupedLevelStats = levelStats.reduce((acc: Record<string, any>, curr) => {
    const key = `Level ${curr.level} (${curr.degree_type})`
    acc[key] = curr
    return acc
  }, {})

  const programmeChartData = Object.entries(groupedProgrammeStats).map(([key, data]) => ({
    name: key,
    ...data,
  }))

  const levelChartData = Object.entries(groupedLevelStats).map(([key, data]) => ({
    name: key,
    ...data,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Programme & Level Voting Statistics</span>
        </CardTitle>
        <CardDescription>Voting turnout breakdown by programme, level, and degree type</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="programme" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="programme" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>By Programme & Degree</span>
            </TabsTrigger>
            <TabsTrigger value="level" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>By Level & Degree</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programme">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={programmeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={11} interval={0} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_students" fill="#3b82f6" name="Total Students" />
                <Bar dataKey="voted_students" fill="#10b981" name="Voted Students" />
              </BarChart>
            </ResponsiveContainer>

            {/* Programme Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {programmeStats.map((stat, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{stat.programme}</h4>
                    <p className="text-sm text-orange-600 font-medium mb-2">{stat.degree_type}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{stat.total_students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Voted:</span>
                        <span className="font-medium text-green-600">{stat.voted_students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnout:</span>
                        <span className="font-bold text-purple-600">{stat.turnout_percentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.turnout_percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="level">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={levelChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total_students" fill="#3b82f6" name="Total Students" />
                <Bar dataKey="voted_students" fill="#10b981" name="Voted Students" />
              </BarChart>
            </ResponsiveContainer>

            {/* Level Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {levelStats.map((stat, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Level {stat.level}</h4>
                    <p className="text-sm text-orange-600 font-medium mb-2">{stat.degree_type}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{stat.total_students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Voted:</span>
                        <span className="font-medium text-green-600">{stat.voted_students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnout:</span>
                        <span className="font-bold text-purple-600">{stat.turnout_percentage}%</span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.turnout_percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
