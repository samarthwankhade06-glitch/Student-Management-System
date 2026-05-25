package com.student.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.SQLException;

public class DatabaseConfig {
    private static final String URL = "jdbc:h2:./student_db;DB_CLOSE_DELAY=-1";
    private static final String USER = "sa";
    private static final String PASSWORD = "";
    private static final String DRIVER_CLASS = "org.h2.Driver";

    static {
        try {
            // Load H2 driver class
            Class.forName(DRIVER_CLASS);
        } catch (ClassNotFoundException e) {
            System.err.println("H2 JDBC Driver not found. Add the driver to the classpath.");
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void initializeDatabase() {
        String createTableSQL = "CREATE TABLE IF NOT EXISTS students (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "name VARCHAR(100) NOT NULL, " +
                "email VARCHAR(100) NOT NULL, " +
                "roll_number VARCHAR(50) UNIQUE NOT NULL, " +
                "course VARCHAR(100) NOT NULL, " +
                "grade VARCHAR(10) NOT NULL" +
                ");";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSQL);
            System.out.println("Database table 'students' initialized successfully.");
            
            // Insert dummy data if table is empty
            String checkEmpty = "SELECT COUNT(*) FROM students";
            var rs = stmt.executeQuery(checkEmpty);
            if (rs.next() && rs.getInt(1) == 0) {
                System.out.println("Database empty. Inserting sample student records...");
                stmt.execute("INSERT INTO students (name, email, roll_number, course, grade) VALUES " +
                        "('John Doe', 'john.doe@university.edu', 'S1001', 'Computer Science', 'A'), " +
                        "('Jane Smith', 'jane.smith@university.edu', 'S1002', 'Data Science', 'A+'), " +
                        "('Alex Johnson', 'alex.j@university.edu', 'S1003', 'Mechanical Engineering', 'B+'), " +
                        "('Sarah Lee', 'sarah.l@university.edu', 'S1004', 'Electrical Engineering', 'A-')");
                System.out.println("Sample records inserted.");
            }
        } catch (SQLException e) {
            System.err.println("Failed to initialize database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
