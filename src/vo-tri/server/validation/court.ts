import { z } from "zod";

export const dilemmaChoiceSchema = z.enum(["a", "b"]);

export const voteDilemmaSchema = z.object({
  dilemmaId: z.string().min(1),
  choice: dilemmaChoiceSchema,
});

export const startCourtTrialSchema = z.object({
  targetId: z.string().uuid(),
  dilemmaId: z.string().min(1),
});

export const submitCourtAnswerSchema = z.object({
  trialId: z.string().uuid(),
  choice: dilemmaChoiceSchema,
});

export type VoteDilemmaInput = z.infer<typeof voteDilemmaSchema>;
export type StartCourtTrialInput = z.infer<typeof startCourtTrialSchema>;
export type SubmitCourtAnswerInput = z.infer<typeof submitCourtAnswerSchema>;
