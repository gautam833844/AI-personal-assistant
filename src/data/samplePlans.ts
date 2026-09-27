import { Plan } from '../types/plan';

export const INITIAL_SAMPLE_PLANS: Plan[] = [
  {
    id: '1',
    name: 'Atlas Project',
    description: 'Hardware, software documentation, and final demo presentation.',
    targetDate: 'Sep 30',
    completed: false,
    tasks: [
      { id: 'p1_1', title: 'Complete hardware testing', completed: true },
      { id: 'p1_2', title: 'Finish documentation', completed: true },
      { id: 'p1_3', title: 'Prepare PPT', completed: true },
      { id: 'p1_4', title: 'Prepare demo', completed: false },
      { id: 'p1_5', title: 'Final presentation', completed: false },
    ],
  },
  {
    id: '2',
    name: 'AI Agent Learning',
    description: 'Master autonomous multi-agent design and tool orchestration.',
    targetDate: 'Oct 30',
    completed: false,
    tasks: [
      { id: 'p2_1', title: 'Foundations of LLM Agents', completed: true },
      { id: 'p2_2', title: 'Tool Calling & Function Execution', completed: true },
      { id: 'p2_3', title: 'Multi-agent Coordination', completed: false },
      { id: 'p2_4', title: 'Memory & Context Management', completed: false },
      { id: 'p2_5', title: 'Evaluation & Benchmarking', completed: false },
    ],
  },
  {
    id: '3',
    name: 'Skubase',
    description: 'Cloud inventory and management platform development.',
    targetDate: 'Oct 31',
    completed: false,
    tasks: [
      { id: 'p3_1', title: 'Architecture & System Design', completed: true },
      { id: 'p3_2', title: 'Core Schema & Models', completed: false },
      { id: 'p3_3', title: 'REST API & Webhooks', completed: false },
      { id: 'p3_4', title: 'Client Dashboard UI', completed: false },
      { id: 'p3_5', title: 'Security & Integration Tests', completed: false },
    ],
  },
];
