/**
 * Voice Agent Test Case Generator
 * 
 * This module provides a framework for generating test cases for voice agents.
 * It creates realistic patient scenarios with randomized data using faker.js.
 * 
 * Example usage:
 * ```typescript
 * import { create_scenarios } from './scenario-generator.js';
 * 
 * const scenarios = create_scenarios(agentConfig, 10);
 * ```
 * 
 * Example output:
 * {
 *   "scenarioName": "Returning Patient - Basic Appointment Request",
 *   "scenarioDescription": "John Doe, a returning patient, calls the clinic to set up a follow-up appointment. He provides his phone number, which the system has on file from a previous visit. He expects the agent to correctly recognize him as a returning patient and confirm his existing details. He wants to schedule a general check-up for next week. He also wonders if his insurance is still on file or if he needs to provide updated information.",
 *   "name": "John Doe",
 *   "dob": "01/01/1980",
 *   "phone": "202-360-9536",
 *   "email": "john.doe@example.com",
 *   "gender": "Male",
 *   "insurance": "Aetna",
 *   "criteria": "The agent smoothly recognizes John as a returning patient using his phone number, verifies personal details, and helps schedule a check-up appointment."
 * }
 */

import { create_scenarios } from './scenario-generator';
import type { VoiceAgentInput } from './types';

// Example agent configuration for testing
const exampleAgentConfig: VoiceAgentInput = {
  agentConfig: {
    actions: ["find_patient_info", "dial_human_agent"],
    initialState: {
      name: "INFORMATION_COLLECTION",
      prompt: "You are an AI receptionist for a clinic. Your goal is to gather patient information, such as contact details and insurance, or look up existing patient records. If the patient needs to schedule an appointment, transition to SCHEDULING_APPOINTMENT. If the call involves a medical history discussion, transition to HPI_COLLECTION. For all other inquiries, connect to a human agent. Always ask for clarifications, ensure accuracy, and thank the patient before ending the call.",
      modelName: "gpt-4o",
      transitions: ["SCHEDULING_APPOINTMENT", "HPI_COLLECTION"],
      initialMessage: "Hello, thank you for calling the clinic. I'm your AI receptionist. Are you a new or returning patient?"
    },
    additionalStates: [
      {
        name: "SCHEDULING_APPOINTMENT",
        prompt: "You are scheduling an appointment for a clinic. Ask the patient their appointment type and offer available slots (e.g., Tuesdays 4-5 PM, Wednesdays 2-3 PM, Fridays 9-10 AM). Confirm or reschedule as needed. Always thank the patient and end the call politely.",
        modelName: "gpt-4o-mini",
        transitions: []
      },
      {
        name: "HPI_COLLECTION",
        prompt: "You are collecting medical history for a patient's upcoming doctor visit. Gather information about their symptoms, medical history, medications, and allergies. Ask clear, step-by-step questions to prepare the doctor for the visit. If unsure about anything, connect to a human agent and thank the patient before ending the call.",
        modelName: "gpt-4o-mini",
        transitions: []
      }
    ]
  }
};

// Generate and export test scenarios
export const testScenarios = create_scenarios(exampleAgentConfig, 10);

// Export the main function for external use
export { create_scenarios };
export type { VoiceAgentInput } from './types.js';