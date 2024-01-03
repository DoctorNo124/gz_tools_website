 # Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy
ENV ASPNETCORE_ENVIRONMENT Production
WORKDIR .
COPY /out .
EXPOSE 80
ENTRYPOINT ["dotnet", "GzToolsAPI.dll"]