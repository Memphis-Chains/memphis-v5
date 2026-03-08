export type SessionRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type GenerationEventRecord = {
  id: string;
  sessionId?: string;
  providerUsed: string;
  modelUsed?: string;
  timingMs: number;
  requestId?: string;
  createdAt: string;
};

export interface SessionRepository {
  ensureSession(sessionId: string): SessionRecord;
  getSessionById(sessionId: string): SessionRecord | null;
  listSessions(): SessionRecord[];
}

export interface GenerationEventRepository {
  create(event: Omit<GenerationEventRecord, 'createdAt'>): GenerationEventRecord;
  listBySession(sessionId: string): GenerationEventRecord[];
}
