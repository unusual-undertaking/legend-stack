import { createAuth } from "../auth";

// This file should only have your auth export for schema generation, and no other code.
// If this file is imported at runtime it will trigger errors due to missing environment variables.

// Export a static instance for Better Auth schema generation
export const auth = createAuth({} as any);
