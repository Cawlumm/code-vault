# Build stage
FROM maven:3.9.6-amazoncorretto-21 AS build
WORKDIR /build

# Leverage caching: copy pom.xml first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Then copy sources
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage (lighter image, still multi-arch)
FROM amazoncorretto:21-alpine-jdk
WORKDIR /app

# Copy built artifact
COPY --from=build /build/target/code-vault-service-0.0.1-SNAPSHOT.jar app.jar

# Runtime configuration
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8080

# Use exec form so signals work properly (graceful shutdown)
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["$JAVA_OPTS"]
