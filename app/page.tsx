"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyStudentId, generateOTP } from "@/lib/actions"
import { GraduationCap, Copy, Check } from "lucide-react"
import Image from "next/image"

export default function WelcomePage() {
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otp, setOtp] = useState("")
  const [copied, setCopied] = useState(false)
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await verifyStudentId(studentId)

      if (!result.success) {
        setError(result.message)
        return
      }

      // Generate OTP
      const otpResult = await generateOTP(result.student.student_id)

      if (!otpResult.success) {
        setError(otpResult.message)
        return
      }

      // Store student ID and OTP
      sessionStorage.setItem("studentId", result.student.student_id)
      sessionStorage.setItem("otp", otpResult.otp ?? "")

      setOtp(otpResult.otp)
      setVerified(true)
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyOTP = async () => {
    await navigator.clipboard.writeText(otp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const proceedToDetails = () => {
    router.push("/student-details")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 h-32 flex items-center justify-center">
            <Image
              src="/images/compssa-logo.png"
              alt="COMPSSA & Accra Technical University Logo"
              width={128}
              height={128}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">COMPSSA Voting System</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Computer Science Students Association Elections
            </CardDescription>
            <CardDescription className="text-sm text-gray-500 mt-1">Accra Technical University</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!verified ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="e.g., 01200644d"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="text-center text-lg"
                  required
                />
              </div>

              {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Student ID Verified!</h3>
                <p className="text-sm text-gray-600 mb-4">Copy the OTP below to proceed to the next step</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center mb-3">
                  <p className="text-sm font-medium text-blue-800 mb-2">Your OTP Code</p>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-3xl font-mono font-bold text-blue-600">{otp}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyOTP}
                      className="flex items-center space-x-1 bg-transparent"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-blue-700 text-center">
                  This code expires in 10 minutes. Keep it safe for the next step.
                </p>
              </div>

              <Button onClick={proceedToDetails} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Proceed to Enter Details
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <GraduationCap className="w-4 h-4" />
              <span>Knowledge, Creativity & Excellence</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  )
}
