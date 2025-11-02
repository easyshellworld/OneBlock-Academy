// lib/db/query/authdb.ts
import prisma from '../index'

type AuthResult = {
  success: boolean;
  name?: string;
  role?: string;
  id?: string;
}

export async function checkWalletAuth(walletAddress: string): Promise<AuthResult> {
  try {
    // 检查员工
    const staff = await prisma.staff.findFirst({
      where: { wallet_address: walletAddress }
    })

    if (staff) {
      return { 
        success: true, 
        role: staff.role, 
        id: String(staff.id), 
        name: staff.name 
      }
    }

    // 检查学生
    const student = await prisma.registration.findFirst({
      where: { wallet_address: walletAddress }
    })

    if (student) {
      if (student.approved) {
        return { 
          success: true, 
          role: "student", 
          id: student.student_id, 
          name: student.student_name 
        }
      } else {
        return { success: true, role: "pending" }
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Auth error:', error)
    return { success: false }
  }
}