import { z } from "zod";

/**
 * Constants for Match Status
 */
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

/**
 * Validates query parameters for listing matches
 */
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Validates the match ID in route parameters
 */
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Helper to validate and coerce ISO Date strings
 */
const dateSchema = z.coerce.date();

/**
 * Schema for creating a new match
 */
export const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: dateSchema,
    endTime: dateSchema,
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });

/**
 * Schema for updating match scores
 */
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
