import { StaysImovel } from '../../stays/stays.service';

export interface SyncImoveisResult {
  totalFetched: number;
  created: number;
  updated: number;
  skipped: number;
  skippedReasons: Record<string, number>;
}

export type StaysImovelResponse = StaysImovel;
