import { Candidates } from "./candidates.model";

export enum ElectionState {
  INITIATED = 0,
  ACTIVE = 1,
  ENDED = 2
}

export interface Election {
  id: number;
  name: string;
  state: ElectionState;
  candidates: Candidates[];
}

