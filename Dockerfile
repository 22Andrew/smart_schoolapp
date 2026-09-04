# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Optional local corporate CA certificates; never copied to the runtime image.
COPY docker/certs/ /tmp/build-certs/
RUN for cert in /tmp/build-certs/*.crt; do \
      [ -f "$cert" ] || continue; \
      keytool -importcert -noprompt -trustcacerts -cacerts -storepass changeit \
        -alias "build-$(basename "$cert" .crt)" -file "$cert"; \
    done

COPY pom.xml .
COPY src ./src
# Resolve only the dependencies needed to package the application.
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring \
    && mkdir -p /data/uploads \
    && chown -R spring:spring /data/uploads

USER spring
COPY --from=build /app/target/smart-school-*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod APP_UPLOAD_DIR=/data/uploads
ENTRYPOINT ["java", "-jar", "app.jar"]
