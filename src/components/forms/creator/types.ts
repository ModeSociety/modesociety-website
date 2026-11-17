import type { Application } from "@/lib/application";
import type { Side } from "@/lib/side";

export type StepProps = { side: Side; a: Application; set: (patch: Partial<Application>) => void };
export type SubmitProps = StepProps & { ready: boolean; clearDraft: () => void; onDone?: (reference: string, a: Application) => void };

export type StepDef = {
  kicker: string;
  title: string;
  /** what still has to be answered before Next (empty: the step is valid) */
  problems: (p: StepProps) => string[];
  render: (p: StepProps) => React.ReactNode;
  /** the last step's submit button */
  submit?: (p: SubmitProps) => React.ReactNode;
};
