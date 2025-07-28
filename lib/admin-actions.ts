"use server"

import { supabase } from "./supabase"
import { cookies } from "next/headers"

export async function adminLogin(username: string, password: string) {
  // In production, use proper password hashing (bcrypt)
  const { data: admin, error } = await supabase.from("admin_users").select("*").eq("username", username).single()

  if (error || !admin) {
    return { success: false, message: "Invalid credentials" }
  }

  // Simple password check (use bcrypt in production)
  if (password !== "admin123") {
    return { success: false, message: "Invalid credentials" }
  }

  // Set admin session cookie
  const cookieStore = await cookies()
  cookieStore.set("admin_session", admin.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return { success: true, admin: { id: admin.id, username: admin.username, full_name: admin.full_name } }
}

export async function verifyAdminSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin_session")?.value

  if (!sessionId) {
    return { success: false, message: "No session found" }
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, username, full_name")
    .eq("id", sessionId)
    .single()

  if (error || !admin) {
    return { success: false, message: "Invalid session" }
  }

  return { success: true, admin }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return { success: true }
}

export async function getDashboardStats() {
  // Get total students and voted count
  const { data: studentStats } = await supabase.from("students").select("has_voted")

  const totalStudents = studentStats?.length || 0
  const votedStudents = studentStats?.filter((s) => s.has_voted).length || 0

  // Get voting statistics
  const { data: votingStats } = await supabase.from("voting_statistics").select("*")

  // Get category-wise vote counts
  const { data: categoryStats } = await supabase.from("voting_statistics").select("category_name, vote_count")

  // Calculate category totals
  const categoryTotals =
    categoryStats?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category_name] = (acc[curr.category_name] || 0) + curr.vote_count
      return acc
    }, {}) || {}

  return {
    totalStudents,
    votedStudents,
    turnoutPercentage: totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0,
    votingStats: votingStats || [],
    categoryTotals,
  }
}

export async function getProgrammeLevelStats() {
  // Get programme-wise voting statistics with degree type
  const { data: programmeStats } = await supabase.rpc("get_programme_voting_stats")

  // Get level-wise voting statistics with degree type
  const { data: levelStats } = await supabase.rpc("get_level_voting_stats")

  return {
    programmeStats: programmeStats || [],
    levelStats: levelStats || [],
  }
}

export async function getCategoryWiseStats() {
  const { data: votingStats } = await supabase.from("voting_statistics").select("*")

  // Group by category
  const categoryData =
    votingStats?.reduce((acc: Record<string, any[]>, curr) => {
      if (!acc[curr.category_name]) {
        acc[curr.category_name] = []
      }
      acc[curr.category_name].push({
        name: curr.candidate_name,
        value: curr.vote_count,
        position: curr.position,
      })
      return acc
    }, {}) || {}

  return categoryData
}

export async function getStudentVotingDetails() {
  const { data: details } = await supabase.from("student_voting_details").select("*")

  return details || []
}

export async function getTransformedStudentData() {
  // Get all categories first
  const { data: categories } = await supabase.from("voting_categories").select("*").order("display_order")

  // Get student details with their votes
  const { data: studentVotes } = await supabase.rpc("get_student_votes_transformed")

  if (!studentVotes) {
    // Fallback: manually transform the data
    const { data: rawData } = await supabase.from("student_voting_details").select("*")

    if (!rawData) return []

    // Group by student
    const studentMap = new Map()

    rawData.forEach((row) => {
      const key = row.student_id
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          student_id: row.student_id,
          student_name: row.student_name,
          phone: row.phone,
          email: row.email,
          programme: row.programme,
          level: row.level,
          degree_type: row.degree_type,
          votes: {},
        })
      }

      if (row.category_name && row.candidate_name) {
        studentMap.get(key).votes[row.category_name] = row.candidate_name
      }
    })

    return Array.from(studentMap.values())
  }

  return studentVotes
}

export async function generateResultsData() {
  const { data: results } = await supabase.from("voting_statistics").select("*").order("category_name, position")

  // Group by category
  const groupedResults =
    results?.reduce((acc: Record<string, any[]>, curr) => {
      if (!acc[curr.category_name]) {
        acc[curr.category_name] = []
      }
      acc[curr.category_name].push(curr)
      return acc
    }, {}) || {}

  return groupedResults
}
