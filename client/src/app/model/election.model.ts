import { Candidates } from "./candidates.model";

export interface Election {
  id: number;
  name: string;
  isActive: boolean;
  isEnded: boolean;
  candidates: Candidates[];
}
