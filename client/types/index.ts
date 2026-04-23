export type Role = "Architect" | "Builder";

// 1 = Foundation (variables / IO)  2 = Walls (conditionals / loops / lists)  3 = Roof (functions)
export type Level = 1 | 2 | 3;

export interface GameState {
  socket: any | null;
  sessionId: string | null;
  playerName: string | null;
  role: Role | null;
  currentStage: number;
  level: Level;
  score: number;
  completedStages: number;
}

export interface Task {
  title: string;
  description: string;
  steps: string[];
  starterCode: string;
  expected_output: string | null;
}

export interface Stage {
  stageNumber: number;
  building: string;
  levels: {
    [L in Level]: {
      Architect: Task[];
      Builder: Task[];
    };
  };
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  role?: Role;
  isSystem?: boolean;
}

export interface ActiveSession {
  id: string;
  stage: number;
  role: Role;
}

export interface RunCodeResponse {
  stdout?: string;
  stderr?: string;
  status?: string;
  passed?: boolean;
}
