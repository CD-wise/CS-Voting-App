"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  verifyAdminSession,
  getDashboardStats,
  getProgrammeLevelStats,
  getCategoryWiseStats,
  getTransformedStudentData,
  generateResultsData,
  adminLogout,
} from "@/lib/admin-actions"
import { Users, Vote, TrendingUp, Download, FileText, LogOut, RefreshCw, Award } from "lucide-react"
import CategoryPieChart from "@/components/category-pie-chart"
import ProgrammeLevelChart from "@/components/programme-level-chart"

interface DashboardStats {
  totalStudents: number
  votedStudents: number
  turnoutPercentage: number
  votingStats: any[]
  categoryTotals: Record<string, number>
}

interface AdminUser {
  id: number
  username: string
  full_name: string
}

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#c2410c", "#0891b2", "#be123c"]

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [programmeLevelStats, setProgrammeLevelStats] = useState<any>({ programmeStats: [], levelStats: [] })
  const [categoryStats, setCategoryStats] = useState<Record<string, any[]>>({})
  const [transformedStudentData, setTransformedStudentData] = useState<any[]>([])
  const [resultsData, setResultsData] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    const result = await verifyAdminSession()
    if (!result.success) {
      router.push("/admin")
      return
    }
    setAdmin(result.admin)
    await loadDashboardData()
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [dashboardStats, progLevelStats, categoryWiseStats, transformedData, results] = await Promise.all([
        getDashboardStats(),
        getProgrammeLevelStats(),
        getCategoryWiseStats(),
        getTransformedStudentData(),
        generateResultsData(),
      ])

      setStats(dashboardStats)
      setProgrammeLevelStats(progLevelStats)
      setCategoryStats(categoryWiseStats)
      setTransformedStudentData(transformedData)
      setResultsData(results)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push("/admin")
  }

  const generatePDF = async () => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // PDF Configuration
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const margin = 20
      let yPosition = margin

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
          return true
        }
        return false
      }

      // Header Section
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("COMPSSA ELECTION RESULTS", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 10

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("Computer Science Students Association", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 8
      doc.text("Accra Technical University", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      // Summary Statistics
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("ELECTION SUMMARY", margin, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Total Registered Students: ${stats?.totalStudents || 0}`, margin, yPosition)
      yPosition += 6
      doc.text(`Students Who Voted: ${stats?.votedStudents || 0}`, margin, yPosition)
      yPosition += 6
      doc.text(`Voter Turnout: ${stats?.turnoutPercentage || 0}%`, margin, yPosition)
      yPosition += 6
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 15

      // Results by Category
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("DETAILED RESULTS", margin, yPosition)
      yPosition += 15

      // Iterate through each category
      Object.entries(resultsData).forEach(([categoryName, candidates], categoryIndex) => {
        checkPageBreak(60) // Check if we need a new page

        // Category Header
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`${categoryIndex + 1}. ${categoryName.toUpperCase()}`, margin, yPosition)
        yPosition += 10

        // Table Header
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")

        // Table structure
        const tableStartY = yPosition
        const colWidths = [20, 80, 30, 30]
        const colPositions = [
          margin,
          margin + colWidths[0],
          margin + colWidths[0] + colWidths[1],
          margin + colWidths[0] + colWidths[1] + colWidths[2],
        ]

        // Draw table header
        doc.rect(
          margin,
          yPosition - 5,
          colWidths.reduce((a, b) => a + b, 0),
          8,
        )
        doc.text("POS", colPositions[0] + 2, yPosition)
        doc.text("CANDIDATE NAME", colPositions[1] + 2, yPosition)
        doc.text("VOTES", colPositions[2] + 2, yPosition)
        doc.text("PERCENTAGE", colPositions[3] + 2, yPosition)
        yPosition += 8

        // Calculate total votes for percentage
        const totalCategoryVotes = candidates.reduce((sum, candidate) => sum + candidate.vote_count, 0)

        // Table rows
        doc.setFont("helvetica", "normal")
        candidates.forEach((candidate, index) => {
          const percentage =
            totalCategoryVotes > 0 ? ((candidate.vote_count / totalCategoryVotes) * 100).toFixed(1) : "0.0"

          // Highlight winner (position 1)
          if (candidate.position === 1) {
            doc.setFillColor(220, 252, 231) // Light green background
            doc.rect(
              margin,
              yPosition - 5,
              colWidths.reduce((a, b) => a + b, 0),
              8,
              "F",
            )
            doc.setFont("helvetica", "bold")
          } else {
            doc.setFont("helvetica", "normal")
          }

          // Draw table borders
          doc.rect(margin, yPosition - 5, colWidths[0], 8)
          doc.rect(margin + colWidths[0], yPosition - 5, colWidths[1], 8)
          doc.rect(margin + colWidths[0] + colWidths[1], yPosition - 5, colWidths[2], 8)
          doc.rect(margin + colWidths[0] + colWidths[1] + colWidths[2], yPosition - 5, colWidths[3], 8)

          // Add text
          doc.text(candidate.position.toString(), colPositions[0] + 10, yPosition, { align: "center" })
          doc.text(candidate.candidate_name, colPositions[1] + 2, yPosition)
          doc.text(candidate.vote_count.toString(), colPositions[2] + 15, yPosition, { align: "center" })
          doc.text(`${percentage}%`, colPositions[3] + 15, yPosition, { align: "center" })

          yPosition += 8
        })

        // Winner announcement
        const winner = candidates.find((c) => c.position === 1)
        if (winner) {
          yPosition += 5
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(22, 163, 74) // Green color
          doc.text(`🏆 WINNER: ${winner.candidate_name} (${winner.vote_count} votes)`, margin, yPosition)
          doc.setTextColor(0, 0, 0) // Reset to black
        }

        yPosition += 20
      })

      // Footer
      checkPageBreak(30)
      yPosition = pageHeight - 40

      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(
        "This is an official election result document generated by the COMPSSA Voting System.",
        pageWidth / 2,
        yPosition,
        { align: "center" },
      )
      yPosition += 6
      doc.text("Accra Technical University - Computer Science Department", pageWidth / 2, yPosition, {
        align: "center",
      })
      yPosition += 10

      // Signature lines
      doc.setFont("helvetica", "normal")
      doc.line(margin, yPosition, margin + 60, yPosition)
      doc.line(pageWidth - margin - 60, yPosition, pageWidth - margin, yPosition)
      yPosition += 6
      doc.setFontSize(9)
      doc.text("Electoral Commissioner", margin + 30, yPosition, { align: "center" })
      doc.text("COMPSSA President", pageWidth - margin - 30, yPosition, { align: "center" })

      // Save the PDF
      const fileName = `COMPSSA_Election_Results_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const generateTransformedCSV = () => {
    if (transformedStudentData.length === 0) {
      alert("No student data available for export")
      return
    }

    // Get all category names from the first student's votes
    const categoryColumns = [
      "Presidential",
      "Vice President",
      "Financial Secretary",
      "General Secretary",
      "General Organizers",
      "WOCOM",
      "PRO",
      "Part-time Representative",
    ]

    // Create CSV header
    const headers = ["Student ID", "Name", "Phone", "Email", "Programme", "Level", ...categoryColumns]

    // Create CSV rows
    const csvRows = [
      headers.join(","),
      ...transformedStudentData.map((student) => {
        const baseInfo = [
          student.student_id,
          `"${student.student_name || ""}"`,
          student.phone || "",
          student.email || "",
          `"${student.programme || ""}"`,
          student.level || "",
        ]

        // Add vote data for each category
        const voteData = categoryColumns.map((category) => {
          const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace("-", "_")
          return `"${student[categoryKey] || student.votes?.[category] || "No Vote"}"`
        })

        return [...baseInfo, ...voteData].join(",")
      }),
    ]

    const csvContent = csvRows.join("\n")

    const element = document.createElement("a")
    const file = new Blob([csvContent], { type: "text/csv" })
    element.href = URL.createObjectURL(file)
    element.download = `student_voting_summary_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {admin?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="flex items-center space-x-2 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Vote className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Voted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.votedStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Turnout</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.turnoutPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Programme/Level Statistics */}
            <ProgrammeLevelChart
              programmeStats={programmeLevelStats.programmeStats}
              levelStats={programmeLevelStats.levelStats}
            />

            {/* Category Pie Charts Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Category-wise Vote Distribution</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(categoryStats).map(([categoryName, data], index) => (
                  <CategoryPieChart key={categoryName} categoryName={categoryName} data={data} colors={COLORS} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="grid gap-6">
              {Object.entries(resultsData).map(([category, candidates]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-xl">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidates.map((candidate, index) => (
                        <div
                          key={candidate.candidate_id}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0 ? "bg-green-50 border border-green-200" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? "bg-green-600" : index === 1 ? "bg-blue-600" : "bg-gray-600"
                              }`}
                            >
                              {candidate.position}
                            </div>
                            <span className="font-medium">{candidate.candidate_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">{candidate.vote_count}</span>
                            <p className="text-sm text-gray-600">votes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Voting Summary</CardTitle>
                <CardDescription>Transformed view showing each student's votes across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Student ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Programme</th>
                        <th className="text-left p-2">Level</th>
                        <th className="text-left p-2">Presidential</th>
                        <th className="text-left p-2">Vice President</th>
                        <th className="text-left p-2">Financial Sec.</th>
                        <th className="text-left p-2">General Sec.</th>
                        <th className="text-left p-2">Gen. Organizers</th>
                        <th className="text-left p-2">WOCOM</th>
                        <th className="text-left p-2">PRO</th>
                        <th className="text-left p-2">Part-time Rep.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformedStudentData.slice(0, 20).map((student, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono">{student.student_id}</td>
                          <td className="p-2">{student.student_name}</td>
                          <td className="p-2">{student.programme}</td>
                          <td className="p-2">{student.level}</td>
                          <td className="p-2 text-xs">
                            {student.presidential || student.votes?.Presidential || "No Vote"}
                          </td>
                          <td className="p-2 text-xs">
                            {student.vice_president || student.votes?.["Vice President"] || "No Vote"}
                          </td>
                          <td className="p-2 text-xs">
                            {student.financial_secretary || student.votes?.["Financial Secretary"] || "No Vote"}
                          </td>
                          <td className="p-2 text-xs">
                            {student.general_secretary || student.votes?.["General Secretary"] || "No Vote"}
                          </td>
                          <td className="p-2 text-xs">
                            {student.general_organizers || student.votes?.["General Organizers"] || "No Vote"}
                          </td>
                          <td className="p-2 text-xs">{student.wocom || student.votes?.WOCOM || "No Vote"}</td>
                          <td className="p-2 text-xs">{student.pro || student.votes?.PRO || "No Vote"}</td>
                          <td className="p-2 text-xs">
                            {student.part_time_representative ||
                              student.votes?.["Part-time Representative"] ||
                              "No Vote"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transformedStudentData.length > 20 && (
                    <p className="text-sm text-gray-600 mt-4 text-center">
                      Showing first 20 entries. Use CSV export for complete data.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span>Official Results PDF</span>
                  </CardTitle>
                  <CardDescription>Generate professional PDF report with complete election results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">PDF Contents:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• COMPSSA & ATU official headers</li>
                        <li>• Election summary & turnout statistics</li>
                        <li>• Detailed results by category with positions</li>
                        <li>• Winner announcements & vote percentages</li>
                        <li>• Professional formatting with signature lines</li>
                        <li>• Generated timestamp & official footer</li>
                      </ul>
                    </div>
                    <Button onClick={generatePDF} className="w-full bg-red-600 hover:bg-red-700">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Official Results PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-green-600" />
                    <span>Student Summary CSV</span>
                  </CardTitle>
                  <CardDescription>Export transformed student voting data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">CSV Layout:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Student info in first columns</li>
                        <li>• Each category as a column header</li>
                        <li>• Voted candidates in single row per student</li>
                        <li>• Easy to analyze in Excel/Sheets</li>
                      </ul>
                    </div>
                    <Button onClick={generateTransformedCSV} className="w-full bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export Student Summary CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Export Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats?.totalStudents}</p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats?.votedStudents}</p>
                    <p className="text-sm text-gray-600">Voted Students</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{Object.keys(resultsData).length}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{stats?.votingStats.length}</p>
                    <p className="text-sm text-gray-600">Total Candidates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
