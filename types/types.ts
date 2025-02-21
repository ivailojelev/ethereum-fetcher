export interface SanitizedTransaction {
  transactionHash: string;
  blockHash: string | null;
  blockNumber: string | null;
  from: string;
  to: string | null;
  input?: string;
  value: string;
}
