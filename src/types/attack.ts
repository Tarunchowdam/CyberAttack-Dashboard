
export interface AttackEvent {
  Country: string;
  AttackType: string;
  AffectedSystem: string;
  Protocol: string;
  SourceIP: string;
  confidence: number;
}
