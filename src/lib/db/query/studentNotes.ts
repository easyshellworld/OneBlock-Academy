// lib/db/query/studentNotes.ts
import prisma from '@/lib/db'

export interface StudentNote {
  id?: number;
  student_id: string;
  student_name: string;
  title: string;
  content_markdown: string;
  created_at?: Date;
  updated_at?: Date;
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

export async function addStudentNote(note: StudentNote): Promise<void> {
  await prisma.studentNote.create({
    data: {
      ...note,
      updated_at: new Date()
    }
  })
}

export async function updateStudentNoteById(id: number, student_id: string, fields: Partial<StudentNote>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<StudentNote> = { ...fields }
    delete data.id
    delete data.student_id
    delete data.created_at
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