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
  approved?: boolean | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
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

    // 准备数据并移除 null 值
    const dataToCreate = {
      ...reg,
      student_id: formattedId,
      updated_at: new Date()
    }
    
    // 移除值为 null 的字段
    Object.keys(dataToCreate).forEach(key => {
      if (dataToCreate[key as keyof typeof dataToCreate] === null) {
        delete dataToCreate[key as keyof typeof dataToCreate]
      }
    })

    const data = await prisma.registration.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToCreate as any
    })

    return { success: true, data: data as Registration }
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
    // 创建副本并排除不应该更新的字段
    const dataToUpdate = { ...updates }
    delete dataToUpdate.id
    delete dataToUpdate.student_id
    delete dataToUpdate.created_at
    
    // 添加更新时间
    dataToUpdate.updated_at = new Date()
    
    // 移除值为 null 的字段
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key as keyof typeof dataToUpdate] === null) {
        delete dataToUpdate[key as keyof typeof dataToUpdate]
      }
    })

    await prisma.registration.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: dataToUpdate as any
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
  const results = await prisma.registration.findMany({
    orderBy: { created_at: 'desc' }
  })
  return results as Registration[]
}

export async function getRegistrationById(id: number): Promise<Registration | null> {
  const result = await prisma.registration.findUnique({
    where: { id }
  })
  return result as Registration | null
}

export async function getRegistrationByStudentId(studentId: string): Promise<Registration | null> {
  const result = await prisma.registration.findUnique({
    where: { student_id: studentId }
  })
  return result as Registration | null
}

export async function getRegistrationsByApprovalStatus(approved: boolean): Promise<Registration[]> {
  const results = await prisma.registration.findMany({
    where: { approved },
    orderBy: { created_at: 'desc' }
  })
  return results as Registration[]
}