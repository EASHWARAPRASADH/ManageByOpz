package com.managemyopz.security.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {
    /**
     * Permission value, format can be "PAGE_CODE:PERMISSION_CODE" or "PERMISSION_CODE".
     * E.g. "EMPLOYEE_DIRECTORY:VIEW", "MY_APPROVALS:APPROVE", "VIEW"
     */
    String value();
}
