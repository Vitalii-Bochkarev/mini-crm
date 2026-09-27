FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["MyProject2.csproj", "./"]
RUN dotnet restore "MyProject2.csproj"

COPY . .
RUN dotnet publish "MyProject2.csproj" \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080

COPY --from=build --chown=$APP_UID:$APP_UID /app/publish .

USER $APP_UID
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=6s --start-period=10s --retries=3 \
    CMD ["dotnet", "MyProject2.dll", "--healthcheck", "http://127.0.0.1:8080/health/ready"]

ENTRYPOINT ["dotnet", "MyProject2.dll"]
