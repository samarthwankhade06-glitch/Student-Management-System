package com.student.dao;

import com.student.config.DatabaseConfig;
import com.student.model.Student;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO {

    public boolean addStudent(Student student) throws SQLException {
        String sql = "INSERT INTO students (name, email, roll_number, course, grade) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, student.getName());
            pstmt.setString(2, student.getEmail());
            pstmt.setString(3, student.getRollNumber());
            pstmt.setString(4, student.getCourse());
            pstmt.setString(5, student.getGrade());
            
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    public List<Student> getAllStudents() throws SQLException {
        List<Student> students = new ArrayList<>();
        String sql = "SELECT * FROM students ORDER BY id DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Student student = new Student(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("roll_number"),
                        rs.getString("course"),
                        rs.getString("grade")
                );
                students.add(student);
            }
        }
        return students;
    }

    public Student getStudentById(int id) throws SQLException {
        String sql = "SELECT * FROM students WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Student(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("email"),
                            rs.getString("roll_number"),
                            rs.getString("course"),
                            rs.getString("grade")
                    );
                }
            }
        }
        return null;
    }

    public boolean updateStudent(Student student) throws SQLException {
        String sql = "UPDATE students SET name = ?, email = ?, roll_number = ?, course = ?, grade = ? WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, student.getName());
            pstmt.setString(2, student.getEmail());
            pstmt.setString(3, student.getRollNumber());
            pstmt.setString(4, student.getCourse());
            pstmt.setString(5, student.getGrade());
            pstmt.setInt(6, student.getId());
            
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    public boolean deleteStudent(int id) throws SQLException {
        String sql = "DELETE FROM students WHERE id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    public boolean isRollNumberExists(String rollNumber, int excludeId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM students WHERE roll_number = ? AND id != ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, rollNumber);
            pstmt.setInt(2, excludeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    public boolean resetDatabase() throws SQLException {
        String dropTable = "DROP TABLE IF EXISTS students";
        String createTable = "CREATE TABLE students (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "name VARCHAR(100) NOT NULL, " +
                "email VARCHAR(100) NOT NULL, " +
                "roll_number VARCHAR(50) UNIQUE NOT NULL, " +
                "course VARCHAR(100) NOT NULL, " +
                "grade VARCHAR(10) NOT NULL" +
                ");";
        String insertSamples = "INSERT INTO students (name, email, roll_number, course, grade) VALUES " +
                "('John Doe', 'john.doe@acet.edu', 'S1001', 'BE Computer Science', 'A'), " +
                "('Jane Smith', 'jane.smith@acet.edu', 'S1002', 'BE Information Technology', 'A+'), " +
                "('Alex Johnson', 'alex.j@acet.edu', 'S1003', 'BE Mechanical Engineering', 'B+'), " +
                "('Sarah Lee', 'sarah.l@acet.edu', 'S1004', 'BE Electronics and Telecommunication', 'A-')";
        
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(dropTable);
            stmt.execute(createTable);
            stmt.execute(insertSamples);
            return true;
        }
    }
}
