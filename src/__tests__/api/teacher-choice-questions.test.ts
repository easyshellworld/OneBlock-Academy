import { jest } from '@jest/globals';

jest.mock('@/lib/db/query/choiceQuestions', () => ({
  getAllChoiceQuestions: jest.fn(),
  addChoiceQuestion: jest.fn(),
  updateChoiceQuestion: jest.fn(),
  deleteChoiceQuestion: jest.fn(),
  deleteChoiceQuestionsByTaskNumber: jest.fn(),
}));

import {
  getAllChoiceQuestions,
  addChoiceQuestion,
  updateChoiceQuestion,
  deleteChoiceQuestion,
  deleteChoiceQuestionsByTaskNumber,
} from '@/lib/db/query/choiceQuestions';

const mockAdd = jest.mocked(addChoiceQuestion);
const mockUpdate = jest.mocked(updateChoiceQuestion);
const mockDelete = jest.mocked(deleteChoiceQuestion);
const mockGetAll = jest.mocked(getAllChoiceQuestions);
const mockDeleteByTask = jest.mocked(deleteChoiceQuestionsByTaskNumber);

function buildRequest(body: object) {
  return new Request('http://localhost/api/teacher/choice-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/teacher/choice-questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdd.mockResolvedValue(undefined);
  });

  describe('action: get', () => {
    it('返回所有题目', async () => {
      mockGetAll.mockResolvedValue([]);
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'get' }) as any);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('action: add', () => {
    const singleQuestion = {
      task_number: 1,
      question_number: 1,
      question_text: '测试题',
      options: { A: '选项A', B: '选项B' },
      question_type: 'single',
      correct_options: ['A'],
      score: 2,
    };

    it('批量添加：等待所有题目写入后才返回', async () => {
      let resolveCount = 0;
      mockAdd.mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 10));
        resolveCount++;
      });

      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'add', questions: [singleQuestion, singleQuestion] }) as any
      );
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(resolveCount).toBe(2);
    });

    it('批量添加成功，消息包含数量', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'add', questions: [singleQuestion, singleQuestion] }) as any
      );
      const body = await res.json();
      expect(body.message).toContain('2');
    });

    it('单个添加也正常工作', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'add', question: singleQuestion }) as any
      );
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(mockAdd).toHaveBeenCalled();
    });
  });

  describe('action: update', () => {
    it('缺少 id 返回 400', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'update', updates: { score: 5 } }) as any
      );
      expect(res.status).toBe(400);
    });

    it('成功更新返回 success', async () => {
      mockUpdate.mockResolvedValue({ success: true, changes: 1 });
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'update', id: 1, updates: { score: 5 } }) as any
      );
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it('数据库更新失败返回错误', async () => {
      mockUpdate.mockResolvedValue({ success: false, error: 'DB error' });
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(
        buildRequest({ action: 'update', id: 1, updates: { score: 5 } }) as any
      );
      expect(res.status).toBe(400);
    });
  });

  describe('action: delete', () => {
    it('缺少 id 返回 400', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'delete' }) as any);
      expect(res.status).toBe(400);
    });

    it('成功删除返回 success', async () => {
      mockDelete.mockResolvedValue({ success: true, changes: 1 });
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'delete', id: '1' }) as any);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe('action: deleteByTask', () => {
    it('缺少 taskNumber 返回 400', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'deleteByTask' }) as any);
      expect(res.status).toBe(400);
    });

    it('成功批量删除', async () => {
      mockDeleteByTask.mockResolvedValue({ success: true, changes: 3 });
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'deleteByTask', taskNumber: 1 }) as any);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toContain('3');
    });
  });

  describe('未知 action', () => {
    it('返回 400', async () => {
      const { POST } = await import('@/app/api/teacher/choice-questions/route');
      const res = await POST(buildRequest({ action: 'unknown' }) as any);
      expect(res.status).toBe(400);
    });
  });
});
