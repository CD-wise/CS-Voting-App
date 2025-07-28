"use server"

import { supabase } from "./supabase"

export async function verifyStudentId(studentId: string) {
  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("student_id", studentId.toLowerCase())
    .single()

  if (error || !student) {
    return { success: false, message: "Student ID not found" }
  }

  if (student.has_voted) {
    return { success: false, message: "Student has already voted" }
  }

  return { success: true, student }
}

export async function generateOTP(studentId: string) {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const { error } = await supabase.from("student_otps").insert({
    student_id: studentId,
    otp_code: otp,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    return { success: false, message: "Failed to generate OTP" }
  }

  return { success: true, otp }
}

export async function verifyOTP(studentId: string, otpCode: string) {
  const { data: otpRecord, error } = await supabase
    .from("student_otps")
    .select("*")
    .eq("student_id", studentId)
    .eq("otp_code", otpCode)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !otpRecord) {
    return { success: false, message: "Invalid or expired OTP" }
  }

  // Mark OTP as used
  await supabase.from("student_otps").update({ used: true }).eq("id", otpRecord.id)

  return { success: true }
}

// Add this new function after verifyOTP
export async function checkEmailAvailability(email: string) {
  const { data: existingEmail, error } = await supabase
    .from("student_details")
    .select("email")
    .eq("email", email.toLowerCase())
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    return { success: false, message: "Error checking email availability" }
  }

  if (existingEmail) {
    return { success: false, message: "This email address has already been used by another student" }
  }

  return { success: true, message: "Email is available" }
}

// Update the saveStudentDetails function to check email uniqueness
export async function saveStudentDetails(
  studentId: string,
  details: {
    name: string
    phone: string
    email: string
    programme: string
    level: number
    degree_type: string
  },
) {
  // First check if email is already used
  const emailCheck = await checkEmailAvailability(details.email)
  if (!emailCheck.success) {
    return emailCheck
  }

  const { error } = await supabase.from("student_details").insert({
    student_id: studentId,
    ...details,
    email: details.email.toLowerCase(), // Store email in lowercase for consistency
  })

  if (error) {
    // Check if it's a unique constraint violation
    if (error.code === "23505" && error.message.includes("unique_student_email")) {
      return { success: false, message: "This email address has already been used by another student" }
    }
    return { success: false, message: "Failed to save student details" }
  }

  return { success: true }
}

export async function getVotingData() {
  const { data: categories } = await supabase.from("voting_categories").select("*").order("display_order")

  const { data: candidates } = await supabase.from("candidates").select("*")

  return { categories: categories || [], candidates: candidates || [] }
}

export async function submitVote(studentId: string, candidateId: number, categoryId: number) {
  // Check if student has already voted in this category
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("student_id", studentId)
    .eq("category_id", categoryId)
    .single()

  if (existingVote) {
    return { success: false, message: "Already voted in this category" }
  }

  const { error } = await supabase.from("votes").insert({
    student_id: studentId,
    candidate_id: candidateId,
    category_id: categoryId,
  })

  if (error) {
    return { success: false, message: "Failed to submit vote" }
  }

  return { success: true }
}

export async function markStudentAsVoted(studentId: string) {
  const { error } = await supabase.from("students").update({ has_voted: true }).eq("student_id", studentId)

  return { success: !error }
}

export async function getStudentVotes(studentId: string) {
  const { data: votes } = await supabase.from("votes").select("category_id").eq("student_id", studentId)

  return votes?.map((vote) => vote.category_id) || []
}
