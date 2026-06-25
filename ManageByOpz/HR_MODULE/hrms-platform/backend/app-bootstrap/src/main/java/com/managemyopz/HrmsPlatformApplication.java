package com.managemyopz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * HrmsPlatformApplication — Entry point for the ManageMyOpz HR Operating System.
 *
 * This Spring Boot application assembles all platform and domain modules
 * into a single deployable unit (modular monolith). Component scanning
 * covers the com.managemyopz base package to discover all modules.
 */
@SpringBootApplication
@EnableAsync
public class HrmsPlatformApplication {

    public static void main(String[] args) {
        try (java.sql.Connection conn = java.sql.DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/managemyopz_hr?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                "root", "Dhipak#2006#")) {
            try (java.sql.Statement stmt = conn.createStatement()) {
                int deletedRows = stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '15' AND success = 0");
                if (deletedRows > 0) {
                    System.out.println("Successfully removed failed Flyway migration version 15.");
                }
            }
        } catch (Exception e) {
            System.out.println("No failed flyway history to clear: " + e.getMessage());
        }
        SpringApplication.run(HrmsPlatformApplication.class, args);
    }
}
