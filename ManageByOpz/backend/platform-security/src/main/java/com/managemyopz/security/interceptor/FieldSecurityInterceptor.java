package com.managemyopz.security.interceptor;

import com.managemyopz.security.service.FieldSecurityService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.lang.reflect.Field;
import java.util.*;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class FieldSecurityInterceptor implements ResponseBodyAdvice<Object> {

    private final FieldSecurityService fieldSecurityService;

    private static final Map<String, List<String>> FIELD_MAPPINGS = Map.of(
            "aadhaar_number", List.of("aadhaarNumber"),
            "pan_number", List.of("panNumber"),
            "passport", List.of("passportNumber", "passportExpiry"),
            "bank_account", List.of("bankAccountNumber", "bankName", "bankIfsc", "bankBranch")
    );

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Intercept all API responses returning ApiResponse or any response payload
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return body;
            }
            String username = auth.getName();

            if (body instanceof ApiResponse) {
                ApiResponse<?> apiResponse = (ApiResponse<?>) body;
                Object data = apiResponse.getData();
                if (data != null) {
                    processObject(data, username);
                }
            } else if (body != null) {
                processObject(body, username);
            }
        } catch (Exception e) {
            log.error("[FLS] Error intercepting response body for field security", e);
        }
        return body;
    }

    private void processObject(Object obj, String username) {
        if (obj instanceof Collection) {
            for (Object item : (Collection<?>) obj) {
                if (item != null) {
                    applyFieldSecurity(item, username);
                }
            }
        } else {
            applyFieldSecurity(obj, username);
        }
    }

    private void applyFieldSecurity(Object target, String username) {
        // We only apply this to EmployeeTwin objects or any DTOs representing employee data
        Class<?> clazz = target.getClass();
        if (!clazz.getSimpleName().equals("EmployeeTwin") && !clazz.getName().contains("com.managemyopz.twin")) {
            return;
        }

        // Apply rules for each mapped field category
        for (Map.Entry<String, List<String>> entry : FIELD_MAPPINGS.entrySet()) {
            String dbFieldName = entry.getKey();
            List<String> javaFields = entry.getValue();

            String accessLevel = fieldSecurityService.getAccessLevel(username, dbFieldName);
            if ("EDITABLE".equalsIgnoreCase(accessLevel)) {
                continue;
            }

            for (String fieldName : javaFields) {
                try {
                    Field field = findUnderlyingField(clazz, fieldName);
                    if (field != null) {
                        field.setAccessible(true);
                        Object value = field.get(target);
                        if (value != null) {
                            if ("HIDDEN".equalsIgnoreCase(accessLevel)) {
                                field.set(target, null);
                            } else if ("MASKED".equalsIgnoreCase(accessLevel) || "READ_ONLY".equalsIgnoreCase(accessLevel)) {
                                // Masking logic: replace with asterisks if it's a string, or null/masked representation
                                if (value instanceof String) {
                                    String strValue = (String) value;
                                    field.set(target, maskString(strValue));
                                } else {
                                    // Non-string fields (like expiry dates) get hidden under masked rules
                                    field.set(target, null);
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.debug("[FLS] Skip field {} on object {}: {}", fieldName, clazz.getSimpleName(), e.getMessage());
                }
            }
        }
    }

    private Field findUnderlyingField(Class<?> clazz, String fieldName) {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        return null;
    }

    private String maskString(String input) {
        if (input == null || input.isBlank()) {
            return input;
        }
        if (input.length() <= 4) {
            return "****";
        }
        return "****" + input.substring(input.length() - 4);
    }
}
