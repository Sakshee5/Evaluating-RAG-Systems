import { Document } from './document';
import { Question } from './question';
import { Configuration } from './configuration';
import { LLMResponse } from './llm_response';

export interface Session {
  documents: Document[];
  questions: Question[];
  configurations: Configuration[];
  answers: LLMResponse[];
}

