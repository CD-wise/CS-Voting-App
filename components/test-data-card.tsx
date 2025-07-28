"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Users, GraduationCap } from "lucide-react"

const testStudents = [
  {
    id: "22200001d",
    name: "John Doe",
    programme: "Computer Science",
    level: 100,
    description: "Fresh CS student",
  },
  {
    id: "19200030a",
    name: "Sarah Wilson",
    programme: "Computer Science",
    level: 400,
    description: "Final year CS student",
  },
  {
    id: "21300010c",
    name: "Michael Johnson",
    programme: "Information Technology",
    level: 200,
    description: "Second year IT student",
  },
  {
    id: "20400020b",
    name: "Emma Taylor",
    programme: "Cybersecurity",
    level: 300,
    description: "Third year Cybersecurity student",
  },
  {
    id: "22300001d",
    name: "David Brown",
    programme: "Information Technology",
    level: 100,
    description: "Fresh IT student",
  },
  {
    id: "19400030a",
    name: "Lisa Garcia",
    programme: "Cybersecurity",
    level: 400,
    description: "Final year Cybersecurity student",
  },
]

export default function TestDataCard() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyStudentId = async (studentId: string) => {
    await navigator.clipboard.writeText(studentId)
    setCopiedId(studentId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Test Student IDs</span>
        </CardTitle>
        <CardDescription>Use these sample student IDs to test the voting system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testStudents.map((student) => (
            <Card key={student.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-blue-600">{student.id}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyStudentId(student.id)}
                      className="flex items-center space-x-1"
                    >
                      {copiedId === student.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span className="text-xs">{copiedId === student.id ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <GraduationCap className="w-3 h-3" />
                      <span>Level {student.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{student.programme}</p>
                    <p className="text-xs text-gray-500">{student.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Copy any student ID above</li>
            <li>2. Paste it in the welcome page</li>
            <li>3. Copy the generated OTP</li>
            <li>4. Fill in student details matching the profile</li>
            <li>5. Paste the OTP and proceed to vote</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
