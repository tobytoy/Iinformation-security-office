export interface UserProfile {
  nickname: string;
  role: string;
  avatarColor: string;
}

export type ChallengeStatus = 'unsolved' | 'in_progress' | 'stuck' | 'solved';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  addedBy: string;
  createdAt: string;
}

export interface AnswerAttempt {
  id: string;
  attemptedBy: string;
  key: string;
  value: string;
  status: 'failed' | 'passed';
  note?: string;
  timestamp: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: string;
  points?: string;
  status: ChallengeStatus;
  assignedTo?: string;
  description?: string;
  targetFields?: string[];
  attempts: AnswerAttempt[];
  keyValues: KeyValuePair[];
  createdAt: string;
  updatedAt: string;
}

export type IntelType = 'ip' | 'domain' | 'url' | 'path' | 'hash' | 'email' | 'cve' | 'registry' | 'other';
export type IntelStatus = 'uncovered' | 'invalid' | 'pending';

export interface IntelItem {
  id: string;
  type: IntelType;
  key: string; // Context / Subtitle (e.g. C&C Process, Destination URL)
  value: string; // Indicator value
  description?: string;
  status: IntelStatus;
  score?: number; // e.g. +50, +100
  addedBy: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  isCode?: boolean;
  createdAt: string;
}

export type CheatsheetCategory = 'windows_cmd' | 'windows_ps' | 'linux' | 'paloalto' | 'fortinet' | 'splunk';

export interface CheatsheetItem {
  id: string;
  category: CheatsheetCategory;
  title: string;
  description: string;
  command: string;
  tags?: string[];
}
