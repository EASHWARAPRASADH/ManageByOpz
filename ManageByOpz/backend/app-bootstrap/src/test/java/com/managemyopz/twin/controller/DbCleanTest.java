package com.managemyopz.twin.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

@SpringBootTest(classes = com.managemyopz.HrmsPlatformApplication.class, 
                properties = "spring.flyway.enabled=false")
public class DbCleanTest {
    @Autowired
    private DataSource dataSource;

    @Test
    public void cleanFlyway() throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '17'");
            System.out.println("Successfully deleted version 17 from flyway_schema_history!");

            try (ResultSet rs = stmt.executeQuery("SELECT * FROM security_permissions LIMIT 1")) {
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                System.out.println("Columns in security_permissions:");
                for (int i = 1; i <= columnCount; i++) {
                    System.out.println("  " + metaData.getColumnName(i) + " (" + metaData.getColumnTypeName(i) + ")");
                }
            }
        }
    }
}
