// lib/db/query/courseContents.ts
import prisma from '@/lib/db'

export interface CourseContent {
  id?: number;
  title: string;
  type: 'announcement' | 'resource';
  task_number?: number;
  content_markdown: string;
  is_pinned?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// 辅助函数：确保布尔字段类型正确
function normalizeContentData(content: Record<string, unknown>) {
  const normalized = { ...content }
  
  // 转换 is_pinned 为布尔值
  if ('is_pinned' in normalized) {
    if (normalized.is_pinned === 1 || normalized.is_pinned === '1' || normalized.is_pinned === true) {
      normalized.is_pinned = true
    } else if (normalized.is_pinned === 0 || normalized.is_pinned === '0' || normalized.is_pinned === false) {
      normalized.is_pinned = false
    } else if (normalized.is_pinned === null || normalized.is_pinned === undefined) {
      delete normalized.is_pinned
    }
  }
  
  // 移除 null 值
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === null) {
      delete normalized[key]
    }
  })
  
  return normalized
}

export async function getAllCourseContents(): Promise<CourseContent[]> {
  const results = await prisma.courseContent.findMany({
    orderBy: { created_at: 'desc' }
  })
  return results as CourseContent[]
}

export async function addCourseContent(content: Omit<CourseContent, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const dataToCreate = normalizeContentData({
    ...content,
    updated_at: new Date()
  })
  
  await prisma.courseContent.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: dataToCreate as any
  })
}

export async function updateCourseContent(id: number, updates: Partial<CourseContent>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const dataToUpdate = { ...updates }
    delete dataToUpdate.id
    delete dataToUpdate.created_at
    dataToUpdate.updated_at = new Date()
    
    const normalized = normalizeContentData(dataToUpdate)

    await prisma.courseContent.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: normalized as any
    })

    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteCourseContent(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.courseContent.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}