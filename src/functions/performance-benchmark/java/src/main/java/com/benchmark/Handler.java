package com.benchmark;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import java.util.Map;
import java.util.HashMap;

public class Handler implements RequestHandler<Object, Map<String, Object>> {
    @Override
    public Map<String, Object> handleRequest(Object input, Context context) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> body = new HashMap<>();
        
        body.put("message", "Hello, world!");
        
        response.put("statusCode", 200);
        response.put("body", toJson(body));
        
        return response;
    }
    
    private String toJson(Map<String, String> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (!first) {
                sb.append(",");
            }
            sb.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
            first = false;
        }
        
        sb.append("}");
        return sb.toString();
    }
} 