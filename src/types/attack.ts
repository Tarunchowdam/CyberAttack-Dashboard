
export interface AttackEvent {
  detection: any;
  Country: string;
  AttackType: string;
  AffectedSystem: string;
  Protocol: string;
  SourceIP: string;
  confidence: number;
}
