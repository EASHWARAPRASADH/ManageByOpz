package com.managemyopz.security.service;

import com.managemyopz.security.entity.FieldPermission;
import java.util.List;

public interface FieldSecurityService {
    List<FieldPermission> getAllFieldPermissions();
    FieldPermission saveFieldPermission(FieldPermission permission, String actor);
    String getAccessLevel(String username, String fieldName);
}
