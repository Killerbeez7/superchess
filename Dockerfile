# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/SuperChess.Api/SuperChess.Api.csproj backend/SuperChess.Api/
COPY core/SuperChess.Core/SuperChess.Core.csproj core/SuperChess.Core/

RUN dotnet restore backend/SuperChess.Api/SuperChess.Api.csproj

COPY backend/ backend/
COPY core/ core/

RUN dotnet publish backend/SuperChess.Api/SuperChess.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SuperChess.Api.dll"]