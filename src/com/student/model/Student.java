package com.student.model;

public class Student {
    private int id;
    private String name;
    private String email;
    private String rollNumber;
    private String course;
    private String grade;

    // Constructors
    public Student() {
    }

    public Student(String name, String email, String rollNumber, String course, String grade) {
        this.name = name;
        this.email = email;
        this.rollNumber = rollNumber;
        this.course = course;
        this.grade = grade;
    }

    public Student(int id, String name, String email, String rollNumber, String course, String grade) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.rollNumber = rollNumber;
        this.course = course;
        this.grade = grade;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    // Convert object to custom JSON string
    public String toJson() {
        return String.format("{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\",\"rollNumber\":\"%s\",\"course\":\"%s\",\"grade\":\"%s\"}",
                id, escapeJson(name), escapeJson(email), escapeJson(rollNumber), escapeJson(course), escapeJson(grade));
    }

    private String escapeJson(String val) {
        if (val == null) return "";
        return val.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", rollNumber='" + rollNumber + '\'' +
                ", course='" + course + '\'' +
                ", grade='" + grade + '\'' +
                '}';
    }
}
