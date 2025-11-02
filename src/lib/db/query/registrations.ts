// lib/db/query/registrations.ts
import prisma from '@/lib/db'

export interface Registration {
  id: number;
  student_name: string;
  wechat_id: string;
  phone: string;
  email: string;
  gender: string;
  age_group: string;
  education: string;
  university: string;
  major: string;
  city: string;
  role: string;
  languages: string;
  experience: string;
  source: string;
  has_web3_experience: boolean;
  study_time: string;
  interests: string;
  platforms: string;
  willing_to_hackathon: boolean;
  willing_to_lead: boolean;
  wants_private_service: boolean;
  referrer: string;
  wallet_address: string;
  student_id: string;
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function addRegistration(reg: Omit<Registration, 'student_id' | 'id'>): Promise<{success: boolean, data?: Registration}> {
  try {
    // 获取当前最大 student_id
    const result = await prisma.registration.aggregate({
      _max: {
        student_id: true
      }
    })

    const initialStudentId = process.env.INITIAL_STUDENT_ID || "1799"
    const maxId = result._max.student_id || initialStudentId
    const nextId = parseInt(maxId, 10) + 1
    const formattedId = nextId.toString().padStart(4, '0')

    const data = await prisma.registration.create({
      data: {
        ...reg,
        student_id: formattedId,
        updated_at: new Date()
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to add registration:', error)
    return { success: false }
  }
}

export async function updateApprovalStatus(id: number, approved: boolean): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.registration.update({
      where: { id },
      data: { 
        approved,
        updated_at: new Date()
      }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function updateRegistration(id: number, updates: Partial<Registration>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<Registration> = { ...updates }
    delete data.id
    delete data.student_id
    data.updated_at = new Date().toDateString()

    await prisma.registration.update({
      where: { id },
      data
    })

    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteRegistration(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.registration.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function getAllRegistrations(): Promise<Registration[]> {
  return await prisma.registration.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function getRegistrationById(id: number): Promise<Registration | null> {
  return await prisma.registration.findUnique({
    where: { id }
  })
}

export async function getRegistrationByStudentId(studentId: string): Promise<Registration | null> {
  return await prisma.registration.findUnique({
    where: { student_id: studentId }
  })
}

export async function getRegistrationsByApprovalStatus(approved: boolean): Promise<Registration[]> {
  return await prisma.registration.findMany({
    where: { approved },
    orderBy: { created_at: 'desc' }
  })
}