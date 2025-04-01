import { Document } from './document';
import { Question } from './question';
import { Configuration } from './configuration';

export interface Session {
  documents: Document[];
  questions: Question[];
  configurations: Configuration[];
}

