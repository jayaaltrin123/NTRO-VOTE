# syntax=docker/dockerfile:1

##############################
# 1️⃣ Build Stage - Maven + JDK 21
##############################
FROM --platform=linux/amd64 maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy & download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Package JAR
RUN mvn clean package -DskipTests


##############################
# 2️⃣ Run Stage - Lightweight JDK 21
##############################
FROM --platform=linux/amd64 eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
