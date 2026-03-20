import { jest } from '@jest/globals';

jest.mock('@/lib/db/query/choiceQuestions', () => ({
  getQuestionsWithoutAnswers: jest.fn(),
  getAllChoiceQuestions: jest.fn(),
  calculateChoiceScore: jest.fn(),
}));

jest.mock('@/lib/db/query/taskScores', () => ({
  getTaskScoresByStudent: jest.fn(),
  createTaskScore: jest.fn(),
}));

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

import { getToken } from 'next-auth/jwt';
import {
  getQuestionsWithoutAnswers,
  getAllChoiceQuestions,
  calculateChoiceScore,
} from '@/lib/db/query/choiceQuestions';
import { getTaskScoresByStudent, createTaskScore } from '@/lib/db/query/taskScores';

const mockGetToken = jest.mocked(getToken);
const mockGetQuestions = jest.mocked(getAllChoiceQuestions);
const mockCalculate = jest.mocked(calculateChoiceScore);
const mockGetScores = jest.mocked(getTaskScoresByStudent);
const mockCreateScore = jest.mocked(createTaskScore);

function buildPostRequest(body: object) {
  return new Request('http://localhost/api/student/choice-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockQuestions = [
  {
    id: 1,
    task_number: 1,
    question_number: 1,
    question_text: '测试题',
    options: { A: '选项A', B: '选项B' },
    question_type: 'single' as const,
    correct_options: ['A'],
    score: 2,
  },
];

describe('POST /api/student/choice-questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockResolvedValue({ id: 'stu-001', role: 'student' } as any);
    mockGetQuestions.mockResolvedValue(mockQuestions);
    mockGetScores.mockResolvedValue([]);
    mockCalculate.mockResolvedValue(2);
    mockCreateScore.mockResolvedValue({} as any);
  });

  describe('身份校验', () => {
    it('student_id 与 token.id 不匹配时返回 403', async () => {
      mockGetToken.mockResolvedValue({ id: 'stu-999', role: 'student' } as any);
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 1, answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(403);
    });

    it('token 不存在时返回 403', async () => {
      mockGetToken.mockResolvedValue(null);
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 1, answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(403);
    });
  });

  describe('输入校验', () => {
    it('缺少 student_id 返回 403', async () => {
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ task_number: 1, answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(403);
    });

    it('缺少 task_number 返回 400', async () => {
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(400);
    });

    it('answers 不是 object 返回 400', async () => {
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 1, answers: 'wrong' }) as any
      );
      expect(res.status).toBe(400);
    });
  });

  describe('正常提交', () => {
    it('首次提交正确，返回得分和总分', async () => {
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 1, answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.score).toBe(2);
      expect(body.max_score).toBe(2);
      expect(mockCreateScore).toHaveBeenCalled();
    });

    it('已完成的 task 再次提交返回 400', async () => {
      mockGetScores.mockResolvedValue([
        {
          id: 1,
          student_id: 'stu-001',
          task_number: 1,
          score_type: 'choice',
          score: 2,
          completed: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 1, answers: { 1: ['A'] } }) as any
      );
      expect(res.status).toBe(400);
    });

    it('该 task 没有题目时返回 404', async () => {
      mockGetQuestions.mockResolvedValue([]);
      const { POST } = await import('@/app/api/student/choice-questions/route');
      const res = await POST(
        buildPostRequest({ student_id: 'stu-001', task_number: 99, answers: {} }) as any
      );
      expect(res.status).toBe(404);
    });
  });
});
