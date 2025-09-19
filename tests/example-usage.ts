import { create_scenarios } from './scenario-generator';
import type { VoiceAgentInput } from './types';

// Example agent configuration
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

// Generate test scenarios
console.log('Generating test scenarios...');
const scenarios = create_scenarios(exampleAgentConfig, 5);

console.log('Generated scenarios:');
console.log(JSON.stringify(scenarios, null, 2));

// Export for use in other files
export { scenarios, exampleAgentConfig };
