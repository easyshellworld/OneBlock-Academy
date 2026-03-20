import { jest } from '@jest/globals';

jest.mock('@/lib/db');

import prisma from '@/lib/db';
import {
  calculateChoiceScore,
  getAllChoiceQuestions,
  addChoiceQuestion,
  ChoiceQuestion
} from '@/lib/db/query/choiceQuestions';

const mockPrisma = jest.mocked(prisma, true);

const mockSingleQuestion = {
  id: 1,
  task_number: 1,
  question_number: 1,
  question_text: '以下哪个是区块链？',
  options: JSON.stringify({ A: 'Bitcoin', B: 'Excel', C: 'Word', D: 'PPT' }),
  question_type: 'single',
  correct_options: JSON.stringify(['A']),
  score: 2,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockMultipleQuestion = {
  id: 2,
  task_number: 1,
  question_number: 2,
  question_text: '以下哪些是公链？',
  options: JSON.stringify({ A: 'Ethereum', B: 'MySQL', C: 'Polkadot', D: 'Redis' }),
  question_type: 'multiple',
  correct_options: JSON.stringify(['A', 'C']),
  score: 3,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

describe('getAllChoiceQuestions', () => {
  it('正确解析 options 和 correct_options JSON', async () => {
    mockPrisma.choiceQuestion.findMany.mockResolvedValue([mockSingleQuestion]);
    const result = await getAllChoiceQuestions();
    expect(result[0].options).toEqual({ A: 'Bitcoin', B: 'Excel', C: 'Word', D: 'PPT' });
    expect(result[0].correct_options).toEqual(['A']);
  });

  it('返回空数组当数据库无数据', async () => {
    mockPrisma.choiceQuestion.findMany.mockResolvedValue([]);
    const result = await getAllChoiceQuestions();
    expect(result).toEqual([]);
  });
});

describe('calculateChoiceScore', () => {
  beforeEach(() => {
    mockPrisma.choiceQuestion.findMany.mockResolvedValue([mockSingleQuestion, mockMultipleQuestion]);
  });

  describe('单选题评分', () => {
    it('回答正确得满分', async () => {
      const score = await calculateChoiceScore({ 1: ['A'] });
      expect(score).toBe(2);
    });

    it('回答错误得 0 分', async () => {
      const score = await calculateChoiceScore({ 1: ['B'] });
      expect(score).toBe(0);
    });
  });

  describe('多选题评分', () => {
    it('所有答案正确得满分', async () => {
      const score = await calculateChoiceScore({ 2: ['A', 'C'] });
      expect(score).toBe(3);
    });

    it('顺序不同但答案一致也得满分', async () => {
      const score = await calculateChoiceScore({ 2: ['C', 'A'] });
      expect(score).toBe(3);
    });

    it('答案不完整得 0 分（不支持部分分）', async () => {
      const score = await calculateChoiceScore({ 2: ['A'] });
      expect(score).toBe(0);
    });

    it('包含错误选项得 0 分', async () => {
      const score = await calculateChoiceScore({ 2: ['A', 'B', 'C'] });
      expect(score).toBe(0);
    });

    it('完全答错得 0 分', async () => {
      const score = await calculateChoiceScore({ 2: ['B', 'D'] });
      expect(score).toBe(0);
    });
  });

  describe('混合答题', () => {
    it('单选正确 + 多选正确 = 总分相加', async () => {
      const score = await calculateChoiceScore({ 1: ['A'], 2: ['A', 'C'] });
      expect(score).toBe(5);
    });

    it('单选正确 + 多选错误 = 只计单选分', async () => {
      const score = await calculateChoiceScore({ 1: ['A'], 2: ['A'] });
      expect(score).toBe(2);
    });

    it('跳过未作答题目', async () => {
      const score = await calculateChoiceScore({ 1: ['A'] });
      expect(score).toBe(2);
    });

    it('不存在的题目 ID 被忽略', async () => {
      const score = await calculateChoiceScore({ 999: ['A'] });
      expect(score).toBe(0);
    });
  });
});
