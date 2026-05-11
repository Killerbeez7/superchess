import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_GAME_HUB_URL ?? "http://localhost:5199/gamehub";

export function createGameHubConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}
