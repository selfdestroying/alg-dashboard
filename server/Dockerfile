FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder


WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=builder /app/publish .
EXPOSE 5000
ENTRYPOINT [ "dotnet", "alg-dashboard-server.dll"]