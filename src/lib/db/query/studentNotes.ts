// lib/db/query/studentNotes.ts
import prisma from '@/lib/db'

export interface StudentNote {
  id?: number;
  student_id: string;
  student_name: string;
  title: string;
  content_markdown: string;
  created_at?: Date;
  updated_at?: Date | null; // 修改为允许 null
}

export async function getAllStudentNotes(): Promise<StudentNote[]> {
  return await prisma.studentNote.findMany({
    orderBy: { created_at: 'desc' }
  })
}

export async function getNotesByStudentId(studentId: string): Promise<StudentNote[]> {
  return await prisma.studentNote.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: 'desc' }
  })
}

export async function addStudentNote(note: Omit<StudentNote, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await prisma.studentNote.create({
    data: {
      ...note,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
}

export async function updateStudentNoteById(id: number, student_id: string, fields: Partial<Omit<StudentNote, 'id' | 'student_id' | 'created_at'>>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<StudentNote> = { ...fields }
    data.updated_at = new Date()

    const result = await prisma.studentNote.updateMany({
      where: { 
        id,
        student_id 
      },
      data
    })

    return { success: true, changes: result.count }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteStudentNoteById(id: number, student_id: string): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const result = await prisma.studentNote.deleteMany({
      where: { 
        id,
        student_id 
      }
    })
    return { success: true, changes: result.count }
  } catch (error) {
    return { success: false, error }
  }
}