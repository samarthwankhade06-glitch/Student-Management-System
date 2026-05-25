package com.student;

import com.student.config.DatabaseConfig;
import com.student.handler.StaticFileHandler;
import com.student.handler.StudentApiHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

public class App {
    private static final int PORT = 8082;
    private static final String WEB_DIR = "web";

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("Starting Student Management System Backend...");
        System.out.println("==================================================");

        // 1. Initialize H2 Database
        DatabaseConfig.initializeDatabase();

        // 2. Start HTTP Server
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
            
            // Set up handlers
            server.createContext("/api/students", new StudentApiHandler());
            server.createContext("/", new StaticFileHandler(WEB_DIR));
            
            // Configure server to use a thread pool for handling requests concurrently
            server.setExecutor(Executors.newFixedThreadPool(10));
            
            server.start();
            
            System.out.println("\nBackend Server successfully started!");
            System.out.println(">> Access the Web App at: http://localhost:" + PORT);
            System.out.println(">> REST API endpoint is at: http://localhost:" + PORT + "/api/students");
            System.out.println("==================================================");
            System.out.println("Server is running. Monitoring requests...\n");
            
        } catch (IOException e) {
            System.err.println("Fatal: Could not start HTTP server on port " + PORT);
            System.err.println("Reason: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
