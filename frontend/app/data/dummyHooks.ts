import type { TopicKey } from '../config/topicPrompts';

export type DummyHook = {
  id: string;
  topic: TopicKey;
  content: string;
  preview: string;
};

export const DUMMY_HOOKS: Record<TopicKey, DummyHook[]> = {
  Tech: [
    {
      id: 'tech-1',
      topic: 'Tech',
      preview: 'AI won’t replace you. Someone using AI will.',
      content:
        "AI won’t replace you.\n\nSomeone using AI will.\n\nThat’s the uncomfortable truth most people ignore."
    },
    {
      id: 'tech-2',
      topic: 'Tech',
      preview: 'Most people learn AI the wrong way.',
      content:
        "Most people learn AI the wrong way.\n\nThey start with tools.\nThey should start with problems."
    }
  ],

  Finance: [
    {
      id: 'finance-1',
      topic: 'Finance',
      preview: 'Saving money won’t make you rich.',
      content:
        "Saving money won’t make you rich.\n\nUnderstanding leverage will."
    },
    {
      id: 'finance-2',
      topic: 'Finance',
      preview: 'Your salary is the slowest way to build wealth.',
      content:
        "Your salary is the slowest way to build wealth.\n\nBut nobody tells you that early."
    }
  ],

  Business: [
    {
      id: 'business-1',
      topic: 'Business',
      preview: 'Most businesses fail for one boring reason.',
      content:
        "Most businesses fail for one boring reason.\n\nThey never talk to their customers."
    }
  ],

  Holiday: [
    {
      id: 'holiday-1',
      topic: 'Holiday',
      preview: 'The best trips are never perfectly planned.',
      content:
        "The best trips are never perfectly planned.\n\nThey’re felt, not scheduled."
    }
  ],

  Travel: [
    {
      id: 'travel-1',
      topic: 'Travel',
      preview: 'Travel doesn’t change you. Reflection does.',
      content:
        "Travel doesn’t change you.\n\nReflection does."
    }
  ],

  Lifestyle: [
    {
      id: 'lifestyle-1',
      topic: 'Lifestyle',
      preview: 'Your routine shapes your future.',
      content:
        "Your routine shapes your future.\n\nChange it intentionally."
    }
  ],

  Health: [
    {
      id: 'health-1',
      topic: 'Health',
      preview: 'Being healthy is mostly boring.',
      content:
        "Being healthy is mostly boring.\n\nThat’s why most people quit."
    }
  ]
};
