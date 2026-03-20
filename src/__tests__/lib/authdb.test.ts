import { jest } from '@jest/globals';
import prisma from '@/lib/db';

const mockPrisma = jest.mocked(prisma, true);

jest.mock('@/lib/db');

import { checkWalletAuth } from '@/lib/db/query/authdb';

describe('checkWalletAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('员工（staff）优先检查', () => {
    it('钱包地址是 admin staff，返回 admin 角色', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue({
        id: 1, name: 'Admin', role: 'admin', wallet_address: '0x111',
      } as any);

      const result = await checkWalletAuth('0x111');
      expect(result).toEqual({
        success: true, role: 'admin', id: '1', name: 'Admin',
      });
      expect(mockPrisma.registration.findFirst).not.toHaveBeenCalled();
    });

    it('钱包地址是 teacher staff，返回 teacher 角色', async () => {
      mockPrisma.staff.findFirst.mockResolvedValue({
        id: 2, name: 'Teacher', role: 'teacher', wallet_address: '0x222',
      } as any);

      const result = await checkWalletAuth('0x222');
      expect(result.role).toBe('teacher');
    });
  });

  describe('学生检查', () => {
    beforeEach(() => {
      mockPrisma.staff.findFirst.mockResolvedValue(null);
    });

    it('已审批学生返回 student 角色', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({
        student_id: 'stu-001', student_name: 'Bob', approved: true,
      } as any);

      const result = await checkWalletAuth('0x333');
      expect(result).toEqual({
        success: true, role: 'student', id: 'stu-001', name: 'Bob',
      });
    });

    it('未审批学生返回 pending', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({
        student_id: 'stu-002', student_name: 'Carol', approved: false,
      } as any);

      const result = await checkWalletAuth('0x444');
      expect(result).toEqual({ success: true, role: 'pending' });
    });

    it('地址不存在返回 { success: false }', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);
      const result = await checkWalletAuth('0xnotexist');
      expect(result).toEqual({ success: false });
    });
  });

  describe('数据库异常处理', () => {
    it('数据库抛出错误时返回 { success: false }', async () => {
      mockPrisma.staff.findFirst.mockRejectedValue(new Error('DB connection failed'));
      const result = await checkWalletAuth('0x999');
      expect(result).toEqual({ success: false });
    });
  });
});
