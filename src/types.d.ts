export {};

declare global {
  namespace Express {
    interface Request {
      uid?: string;
      userRecord?: {
        email: string;
        apiKey: string;
        tokensUsed: number;
        tokensLimit: number;
        createdAt: number;
      };
      estimatedTokens?: number;
    }
  }

  interface ImportMeta {
    readonly env: Record<string, string | undefined>;
  }
}
