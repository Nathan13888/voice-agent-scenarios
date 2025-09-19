import { faker } from '@faker-js/faker';

// Type definitions
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

// Insurance providers list
const INSURANCE_PROVIDERS = [
  'Aetna',
  'Blue Cross Blue Shield',
  'Cigna',
  'UnitedHealth',
  'Humana',
  'Kaiser Permanente',
  'Anthem',
  'Medicare',
  'Medicaid',
  'Tricare',
  'AARP',
  'WellCare',
  'Molina Healthcare',
  'Centene',
  'Independence Blue Cross'
];

// Scenario templates based on different patient types and situations
const SCENARIO_TEMPLATES = [
  {
    name: "New Patient - Initial Registration",
    description: "A new patient calls to register for the first time. They need to provide all their information and understand the registration process.",
    criteria: "The agent collects all necessary patient information, explains the registration process, and schedules an initial appointment."
  },
  {
    name: "Returning Patient - Basic Appointment Request",
    description: "A returning patient calls to schedule a routine appointment. They provide their phone number for verification.",
    criteria: "The agent recognizes the patient, verifies their information, and helps schedule an appointment."
  },
  {
    name: "Returning Patient - Insurance Update",
    description: "A returning patient calls to update their insurance information before their upcoming appointment.",
    criteria: "The agent verifies the patient's identity, collects new insurance information, and confirms the update."
  },
  {
    name: "Urgent Care Request",
    description: "A patient calls with urgent medical concerns and needs immediate attention or guidance.",
    criteria: "The agent assesses the urgency, provides appropriate guidance, and either schedules urgent care or connects to a human agent."
  },
  {
    name: "Appointment Rescheduling",
    description: "A patient calls to reschedule their existing appointment due to a conflict or change in plans.",
    criteria: "The agent locates the existing appointment, offers alternative times, and confirms the rescheduling."
  },
  {
    name: "Prescription Refill Request",
    description: "A patient calls to request a prescription refill for their existing medication.",
    criteria: "The agent verifies the patient's identity, checks prescription history, and processes the refill request."
  },
  {
    name: "Insurance Verification",
    description: "A patient calls to verify their insurance coverage and benefits before an appointment.",
    criteria: "The agent verifies the patient's identity, checks insurance information, and provides coverage details."
  },
  {
    name: "Medical Records Request",
    description: "A patient calls to request copies of their medical records for personal use or to share with another provider.",
    criteria: "The agent verifies the patient's identity, explains the records request process, and initiates the request."
  },
  {
    name: "Billing Inquiry",
    description: "A patient calls with questions about their medical bills, payment options, or insurance claims.",
    criteria: "The agent provides billing information, explains payment options, and connects to billing department if needed."
  },
  {
    name: "Specialist Referral",
    description: "A patient calls to request a referral to a specialist or to follow up on a specialist referral.",
    criteria: "The agent verifies the patient's information, processes the referral request, and provides next steps."
  }
];

function generateRandomDateOfBirth(): string {
  const start = new Date(1940, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = faker.date.between({ from: start, to: end });
  return randomDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

function generatePhoneNumber(): string {
  return faker.phone.number('###-###-####');
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const domain = faker.helpers.arrayElement(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateGender(): 'Male' | 'Female' | 'Other' {
  return faker.helpers.arrayElement(['Male', 'Female', 'Other']);
}

function generateInsuranceProvider(): string {
  return faker.helpers.arrayElement(INSURANCE_PROVIDERS);
}

function createScenarioFromTemplate(template: typeof SCENARIO_TEMPLATES[0], agentConfig: any): TestScenario {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const gender = generateGender();
  
  return {
    scenarioName: template.name,
    scenarioDescription: template.description.replace(
      /John Doe|Jane Doe|the patient/gi, 
      fullName
    ),
    name: fullName,
    dob: generateRandomDateOfBirth(),
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    gender,
    insurance: generateInsuranceProvider(),
    criteria: template.criteria
  };
}

function generateCustomScenario(agentConfig: any): TestScenario {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const gender = generateGender();
  
  // Generate a custom scenario based on agent capabilities
  const actions = agentConfig.actions || [];
  const states = [agentConfig.initialState, ...(agentConfig.additionalStates || [])];
  
  let scenarioName = "Custom Patient Interaction";
  let description = `${fullName} calls the clinic with a specific request.`;
  let criteria = "The agent handles the patient's request appropriately.";
  
  // Customize based on available actions and states
  if (actions.includes('find_patient_info')) {
    description += ` They may be a returning patient or need to verify their information.`;
    criteria += " The agent should be able to find and verify patient information.";
  }
  
  if (states.some((state: any) => state.name === 'SCHEDULING_APPOINTMENT')) {
    description += ` They are interested in scheduling an appointment.`;
    criteria += " The agent should help with appointment scheduling.";
  }
  
  if (states.some((state: any) => state.name === 'HPI_COLLECTION')) {
    description += ` They may need to discuss medical history or symptoms.`;
    criteria += " The agent should be prepared to collect medical history if needed.";
  }
  
  if (actions.includes('dial_human_agent')) {
    description += ` If the request is complex, they may need to speak with a human agent.`;
    criteria += " The agent should know when to transfer to a human agent.";
  }
  
  return {
    scenarioName,
    scenarioDescription: description,
    name: fullName,
    dob: generateRandomDateOfBirth(),
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    gender,
    insurance: generateInsuranceProvider(),
    criteria
  };
}

export function create_scenarios(input: VoiceAgentInput, num_scenarios: number): TestScenario[] {
  const scenarios: TestScenario[] = [];
  
  // Generate scenarios from templates (70% of scenarios)
  const templateCount = Math.floor(num_scenarios * 0.7);
  const customCount = num_scenarios - templateCount;
  
  // Shuffle templates to get random selection
  const shuffledTemplates = faker.helpers.shuffle([...SCENARIO_TEMPLATES]);
  
  for (let i = 0; i < templateCount && i < shuffledTemplates.length; i++) {
    scenarios.push(createScenarioFromTemplate(shuffledTemplates[i], input.agentConfig));
  }
  
  // Fill remaining slots with templates if we need more
  if (templateCount > shuffledTemplates.length) {
    for (let i = 0; i < templateCount - shuffledTemplates.length; i++) {
      const template = faker.helpers.arrayElement(SCENARIO_TEMPLATES);
      scenarios.push(createScenarioFromTemplate(template, input.agentConfig));
    }
  }
  
  // Generate custom scenarios (30% of scenarios)
  for (let i = 0; i < customCount; i++) {
    scenarios.push(generateCustomScenario(input.agentConfig));
  }
  
  // Shuffle the final results to mix template and custom scenarios
  return faker.helpers.shuffle(scenarios);
}

// Example usage and test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    console.log('🎯 Voice Agent Test Case Generator');
    console.log('=====================================\n');
  
  // Example agent configuration
  const agentConfig: VoiceAgentInput = {
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
  const numScenarios = process.argv[2] ? parseInt(process.argv[2]) : 5;
  console.log(`Generating ${numScenarios} test scenarios...\n`);
  
  const scenarios = create_scenarios(agentConfig, numScenarios);
  
  // Display results
  scenarios.forEach((scenario, index) => {
    console.log(`📋 Test Case ${index + 1}:`);
    console.log(`   Scenario: ${scenario.scenarioName}`);
    console.log(`   Patient: ${scenario.name} (${scenario.gender})`);
    console.log(`   DOB: ${scenario.dob}`);
    console.log(`   Contact: ${scenario.phone} | ${scenario.email}`);
    console.log(`   Insurance: ${scenario.insurance}`);
    console.log(`   Description: ${scenario.scenarioDescription}`);
    console.log(`   Success Criteria: ${scenario.criteria}`);
    console.log('');
  });
  
  // Export to JSON file
  const outputFile = `test-scenarios-${Date.now()}.json`;
  const fs = await import('fs');
  fs.writeFileSync(outputFile, JSON.stringify(scenarios, null, 2));
  console.log(`💾 Test scenarios exported to: ${outputFile}`);
  
  // Summary statistics
  const genderCounts = scenarios.reduce((acc, scenario) => {
    acc[scenario.gender] = (acc[scenario.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const insuranceCounts = scenarios.reduce((acc, scenario) => {
    acc[scenario.insurance] = (acc[scenario.insurance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
    console.log('\n📊 Summary Statistics:');
    console.log(`   Total scenarios: ${scenarios.length}`);
    console.log(`   Gender distribution:`, genderCounts);
    console.log(`   Insurance providers:`, Object.keys(insuranceCounts).length, 'unique providers');
  }
  
  main().catch(console.error);
}
