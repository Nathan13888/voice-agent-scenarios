import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { create_scenarios } from "~/lib/scenario-generator";
import type { VoiceAgentInput } from "~/types/voice-agent";

export const voiceAgentRouter = createTRPCRouter({
  generateTestCases: publicProcedure
    .input(
      z.object({
        agentConfigJson: z.string().min(1, "Agent configuration is required"),
        numScenarios: z.number().min(1).max(50).default(10),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Parse the JSON string
        const parsedConfig = JSON.parse(input.agentConfigJson);
        
        // Handle both formats: direct config or wrapped in "agentConfig"
        let agentConfig;
        if (parsedConfig.agentConfig) {
          // Format: { "agentConfig": { ... } }
          agentConfig = parsedConfig.agentConfig;
        } else {
          // Format: { "actions": [...], "initialState": {...}, ... }
          agentConfig = parsedConfig;
        }
        
        // Validate the parsed configuration matches our schema
        const agentConfigSchema = z.object({
          actions: z.array(z.string()),
          initialState: z.object({
            name: z.string(),
            prompt: z.string(),
            modelName: z.string(),
            transitions: z.array(z.string()),
            initialMessage: z.string().optional(),
          }),
          additionalStates: z.array(
            z.object({
              name: z.string(),
              prompt: z.string(),
              modelName: z.string(),
              transitions: z.array(z.string()),
              initialMessage: z.string().optional(),
            })
          ),
        });

        const validatedConfig = agentConfigSchema.parse(agentConfig);
        
        const voiceAgentInput: VoiceAgentInput = {
          agentConfig: validatedConfig,
        };

        const scenarios = create_scenarios(voiceAgentInput, input.numScenarios);
        
        return {
          scenarios,
          count: scenarios.length,
          generatedAt: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("Invalid JSON format. Please check your input.");
        }
        if (error instanceof z.ZodError) {
          throw new Error(`Configuration validation failed: ${error.errors.map(e => e.message).join(", ")}`);
        }
        throw new Error("Failed to process agent configuration");
      }
    }),

  getExampleConfig: publicProcedure.query(() => {
    return {
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
  }),
});
