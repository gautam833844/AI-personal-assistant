export interface PlanTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  targetDate: string;
  tasks: PlanTask[];
  completed: boolean;
}
