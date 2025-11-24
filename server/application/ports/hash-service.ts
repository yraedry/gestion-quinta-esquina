export interface HashService {
  hash(value: string): Promise<string>;
  compare(raw: string, hashed: string): Promise<boolean>;
}
