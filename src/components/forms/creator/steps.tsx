"use client";

import { about } from "./about";
import { based } from "./based";
import type { StepDef } from "./types";

export type { StepDef, StepProps, SubmitProps } from "./types";

/** The application's steps, in order (Asha's spec: Step 1, 1b, 1c, 2 … 7). Each card adds its step. */
export const STEPS: StepDef[] = [about, based];
