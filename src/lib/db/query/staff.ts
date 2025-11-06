// lib/db/query/staff.ts
import prisma from '@/lib/db'

export interface Staff {
  id?: number;
  name: string;
  wechat_id: string;
  phone: string;
  role: 'admin' | 'teacher' | 'assistant';
  wallet_address: string;
  approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function getAllStaff(): Promise<Staff[]> {
  const staffs = await prisma.staff.findMany();
  
  // 转换数据以匹配 Staff 接口
  return staffs.map(staff => ({
    id: staff.id,
    name: staff.name,
    wechat_id: staff.wechat_id,
    phone: staff.phone ?? '', // 处理可能的 null 值
    role: staff.role as 'admin' | 'teacher' | 'assistant', // 类型断言
    wallet_address: staff.wallet_address,
    approved: staff.approved ?? false, // 处理可能的 null 值
    created_at: staff.created_at,
    updated_at: staff.updated_at ?? staff.created_at // 处理可能的 null 值
  }));
}

export async function addStaff(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await prisma.staff.create({
    data: {
      ...staff,
      updated_at: new Date()
    }
  })
}

export async function updateStaff(id: number, updates: Partial<Staff>): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    const data: Partial<Staff> = { ...updates }
    delete data.id
    data.updated_at = new Date()

    await prisma.staff.update({
      where: { id },
      data
    })

    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}

export async function deleteStaff(id: number): Promise<{ success: boolean; changes?: number; error?: unknown }> {
  try {
    await prisma.staff.delete({
      where: { id }
    })
    return { success: true, changes: 1 }
  } catch (error) {
    return { success: false, error }
  }
}