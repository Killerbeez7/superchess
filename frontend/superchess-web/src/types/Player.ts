export type PlayerColor = "white" | "black" | "none";

export interface Player {
    id: number;
    displayName: string;
    color: PlayerColor;
    elo?: number;
    avatarUrl?: string;
    isBot?: boolean;
    isOnline?: boolean;
    location?: string | null;
}