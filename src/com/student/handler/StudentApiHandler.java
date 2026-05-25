package com.student.handler;

import com.student.dao.StudentDAO;
import com.student.model.Student;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StudentApiHandler implements HttpHandler {
    private final StudentDAO studentDAO = new StudentDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        
        // Handle CORS Preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            sendCorsHeaders(exchange);
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String path = exchange.getRequestURI().getPath();
            if ("POST".equalsIgnoreCase(method) && (path.endsWith("/reset") || path.endsWith("/reset/"))) {
                handleReset(exchange);
                return;
            }

            switch (method.toUpperCase()) {
                case "GET":
                    handleGet(exchange);
                    break;
                case "POST":
                    handlePost(exchange);
                    break;
                case "PUT":
                    handlePut(exchange);
                    break;
                case "DELETE":
                    handleDelete(exchange);
                    break;
                default:
                    sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method Not Allowed\"}");
            }
        } catch (Exception e) {
            System.err.println("API Error handling request: " + e.getMessage());
            e.printStackTrace();
            sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Internal Server Error: " + escapeJsonString(e.getMessage()) + "\"}");
        }
    }

    private void handleReset(HttpExchange exchange) throws IOException, SQLException {
        boolean success = studentDAO.resetDatabase();
        if (success) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Database reset successfully with clean sample records.\"}");
        } else {
            sendJsonResponse(exchange, 500, "{\"success\":false,\"message\":\"Failed to reset database.\"}");
        }
    }

    private void handleGet(HttpExchange exchange) throws IOException, SQLException {
        List<Student> list = studentDAO.getAllStudents();
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(list.get(i).toJson());
            if (i < list.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        sendJsonResponse(exchange, 200, sb.toString());
    }

    private void handlePost(HttpExchange exchange) throws IOException, SQLException {
        String body = readRequestBody(exchange);
        
        String name = getValueFromJson(body, "name");
        String email = getValueFromJson(body, "email");
        String rollNumber = getValueFromJson(body, "rollNumber");
        String course = getValueFromJson(body, "course");
        String grade = getValueFromJson(body, "grade");

        if (isEmpty(name) || isEmpty(email) || isEmpty(rollNumber) || isEmpty(course) || isEmpty(grade)) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"All fields are required.\"}");
            return;
        }

        // Validate email format (RFC 5322 simplified)
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Invalid email address format.\"}");
            return;
        }

        if (studentDAO.isRollNumberExists(rollNumber, -1)) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Roll Number already exists.\"}");
            return;
        }

        Student student = new Student(name, email, rollNumber, course, grade);
        boolean success = studentDAO.addStudent(student);

        if (success) {
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Student added successfully.\"}");
        } else {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Failed to add student.\"}");
        }
    }

    private void handlePut(HttpExchange exchange) throws IOException, SQLException {
        String body = readRequestBody(exchange);
        
        String idStr = getValueFromJson(body, "id");
        String name = getValueFromJson(body, "name");
        String email = getValueFromJson(body, "email");
        String rollNumber = getValueFromJson(body, "rollNumber");
        String course = getValueFromJson(body, "course");
        String grade = getValueFromJson(body, "grade");

        if (isEmpty(idStr) || isEmpty(name) || isEmpty(email) || isEmpty(rollNumber) || isEmpty(course) || isEmpty(grade)) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"All fields are required.\"}");
            return;
        }

        int id;
        try {
            id = Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Invalid Student ID.\"}");
            return;
        }

        // Validate email format (RFC 5322 simplified)
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Invalid email address format.\"}");
            return;
        }

        if (studentDAO.isRollNumberExists(rollNumber, id)) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Roll Number already exists for another student.\"}");
            return;
        }

        Student student = new Student(id, name, email, rollNumber, course, grade);
        boolean success = studentDAO.updateStudent(student);

        if (success) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Student updated successfully.\"}");
        } else {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Failed to update student.\"}");
        }
    }

    private void handleDelete(HttpExchange exchange) throws IOException, SQLException {
        String query = exchange.getRequestURI().getQuery();
        int id = -1;
        if (query != null && query.contains("id=")) {
            String idStr = query.split("id=")[1].split("&")[0];
            try {
                id = Integer.parseInt(idStr);
            } catch (NumberFormatException ignored) {}
        }

        if (id == -1) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Missing student ID.\"}");
            return;
        }

        boolean success = studentDAO.deleteStudent(id);
        if (success) {
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Student deleted successfully.\"}");
        } else {
            sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Student not found or failed to delete.\"}");
        }
    }

    // Utility methods
    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = is.read(buffer)) != -1) {
                bos.write(buffer, 0, len);
            }
            return bos.toString("UTF-8");
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        byte[] bytes = jsonResponse.getBytes("UTF-8");
        sendCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static String getValueFromJson(String json, String key) {
        // Improved JSON parsing that handles escaped quotes and special characters
        String keyPattern = "\"" + Pattern.quote(key) + "\"\\s*:\\s*";
        Pattern pattern = Pattern.compile(keyPattern);
        Matcher matcher = pattern.matcher(json);
        
        if (!matcher.find()) {
            return null;
        }
        
        int startPos = matcher.end();
        
        // Skip whitespace
        while (startPos < json.length() && Character.isWhitespace(json.charAt(startPos))) {
            startPos++;
        }
        
        if (startPos >= json.length()) {
            return null;
        }
        
        char firstChar = json.charAt(startPos);
        
        if (firstChar == '"') {
            // Parse string value with proper escape sequence handling
            int endPos = startPos + 1;
            StringBuilder value = new StringBuilder();
            while (endPos < json.length()) {
                char ch = json.charAt(endPos);
                if (ch == '\\' && endPos + 1 < json.length()) {
                    // Handle escape sequences
                    endPos++;
                    char nextChar = json.charAt(endPos);
                    switch (nextChar) {
                        case '"': value.append('"'); break;
                        case '\\': value.append('\\'); break;
                        case '/': value.append('/'); break;
                        case 'b': value.append('\b'); break;
                        case 'f': value.append('\f'); break;
                        case 'n': value.append('\n'); break;
                        case 'r': value.append('\r'); break;
                        case 't': value.append('\t'); break;
                        default: value.append(nextChar);
                    }
                } else if (ch == '"') {
                    // End of string
                    return value.toString();
                } else {
                    value.append(ch);
                }
                endPos++;
            }
        } else {
            // Parse unquoted value (number, boolean, null)
            int endPos = startPos;
            while (endPos < json.length() && ",}]".indexOf(json.charAt(endPos)) == -1) {
                endPos++;
            }
            String value = json.substring(startPos, endPos).trim();
            if (!value.isEmpty()) {
                return value;
            }
        }
        
        return null;
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private String escapeJsonString(String val) {
        if (val == null) return "";
        return val.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
