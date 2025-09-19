export interface AgentState {
  name: string;
  prompt: string;
  modelName: string;
  transitions: string[];
  initialMessage?: string;
}

export interface AgentConfig {
  actions: string[];
  initialState: AgentState;
  additionalStates: AgentState[];
}

export interface VoiceAgentInput {
  agentConfig: AgentConfig;
}

export interface TestScenario {
  scenarioName: string;
  scenarioDescription: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  insurance: string;
  criteria: string;
}

export interface ScenarioGeneratorInput {
  agentConfig: AgentConfig;
  numScenarios: number;
}
