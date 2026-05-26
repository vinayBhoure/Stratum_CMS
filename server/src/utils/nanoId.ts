import { nanoid } from "nanoid";

// All entity identifiers in Stratum are opaque nanoid(12), generated in the
// application layer (not by Prisma) so length stays consistent at @db.VarChar(12).
const ID_LENGTH = 12;

export function generateId(): string {
  return nanoid(ID_LENGTH);
}
