"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyOTP, saveStudentDetails, checkEmailAvailability } from "@/lib/actions"
import { User, Phone, Mail, BookOpen, GraduationCap, Key, Award } from "lucide-react"

export default function StudentDetailsPage() {
  const [studentId, setStudentId] = useState("")
  const [storedOtp, setStoredOtp] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    programme: "",
    level: "",
    degree_type: "",
    otpInput: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [emailError, setEmailError] = useState("")
  const [emailChecking, setEmailChecking] = useState(false)

  useEffect(() => {
    const studentIdData = sessionStorage.getItem("studentId")
    const otpData = sessionStorage.getItem("otp")

    if (!studentIdData || !otpData) {
      router.push("/")
      return
    }

    setStudentId(studentIdData)
    setStoredOtp(otpData)
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEmailChange = async (email: string) => {
    handleInputChange("email", email)
    setEmailError("")

    // Only check if email is valid format and not empty
    if (email && email.includes("@") && email.includes(".")) {
      setEmailChecking(true)

      try {
        const result = await checkEmailAvailability(email)
        if (!result.success) {
          setEmailError(result.message)
        } else {
          setEmailError("")
        }
      } catch (error) {
        setEmailError("Error checking email availability")
      } finally {
        setEmailChecking(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Verify OTP first
      const otpResult = await verifyOTP(studentId, formData.otpInput)

      if (!otpResult.success) {
        setError(otpResult.message ?? "OTP verification failed")
        return
      }

      // Save student details
      const detailsResult = await saveStudentDetails(studentId, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        programme: formData.programme,
        level: Number.parseInt(formData.level),
        degree_type: formData.degree_type,
      })

      if (!detailsResult.success) {
        setError("message" in detailsResult && detailsResult.message ? detailsResult.message : "Failed to save student details")
        return
      }

      // Store student details for voting page
      sessionStorage.setItem(
        "studentDetails",
        JSON.stringify({
          studentId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          programme: formData.programme,
          level: formData.level,
          degree_type: formData.degree_type,
        }),
      )

      router.push("/voting")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.name &&
      formData.phone &&
      formData.email &&
      !emailError && // Only check that there's no email error
      formData.programme &&
      formData.level &&
      formData.degree_type &&
      formData.otpInput.length === 6
    )
  }

  if (!studentId) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Enter Your Details</CardTitle>
            <CardDescription>
              Please fill in your information and enter the OTP you copied from the previous step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student ID Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-mono font-bold text-blue-600">{studentId}</p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Full Name</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Phone Number</span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +233241234567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@student.edu.gh"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`${emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                    required
                  />
                  {emailChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0"></span>
                    <span>{emailError}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500">Use your official student email address</p>
              </div>

              {/* Programme */}
              <div className="space-y-2">
                <label htmlFor="programme" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Programme</span>
                </label>
                <Select value={formData.programme} onValueChange={(value) => handleInputChange("programme", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label htmlFor="level" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Level</span>
                </label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Level 100</SelectItem>
                    <SelectItem value="200">Level 200</SelectItem>
                    <SelectItem value="300">Level 300</SelectItem>
                    <SelectItem value="400">Level 400</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Degree Type */}
              <div className="space-y-2">
                <label htmlFor="degree_type" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Degree Type</span>
                </label>
                <Select value={formData.degree_type} onValueChange={(value) => handleInputChange("degree_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTech">BTech (Bachelor of Technology)</SelectItem>
                    <SelectItem value="HND">HND (Higher National Diploma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label htmlFor="otpInput" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Enter OTP</span>
                </label>
                <Input
                  id="otpInput"
                  type="text"
                  placeholder="Paste the 6-digit OTP here"
                  value={formData.otpInput}
                  onChange={(e) => handleInputChange("otpInput", e.target.value)}
                  className="text-center text-lg font-mono"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500">Enter the OTP you copied from the previous step</p>
              </div>

              {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading || !isFormValid()}
              >
                {loading ? "Verifying & Saving..." : "Proceed to Voting"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
