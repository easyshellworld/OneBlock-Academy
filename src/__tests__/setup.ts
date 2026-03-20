import { jest } from '@jest/globals';

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    staff:               { findFirst: jest.fn() },
    registration:        { findFirst: jest.fn(), create: jest.fn() },
    choiceQuestion: {
      findMany:   jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
      deleteMany: jest.fn(),
    },
    taskScore:            { findMany: jest.fn(), create: jest.fn() },
    studentProjectClaim:  { create: jest.fn(), findMany: jest.fn() },
    project:              { findFirst: jest.fn() },
    nonce:                { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  },
}));

jest.mock('viem', () => ({
  verifyMessage: jest.fn(),
}));
