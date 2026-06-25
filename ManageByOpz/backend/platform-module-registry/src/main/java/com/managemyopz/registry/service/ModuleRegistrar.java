package com.managemyopz.registry.service;

/**
 * ModuleRegistrar — Interface that every module must implement to register itself.
 *
 * At startup, the ModuleRegistryService discovers all ModuleRegistrar beans
 * and registers them in the module_registry table. This is the plug-in contract.
 *
 * To add a new module to the platform:
 * 1. Create a Maven module
 * 2. Add Flyway migrations
 * 3. Implement this interface
 * That's it. Nothing else required.
 */
public interface ModuleRegistrar {

    String getModuleCode();
    String getModuleName();
    String getModuleVersion();
    String getDescription();
    String getIcon();
    String getRoute();
    String getApiPrefix();
    int getDisplayOrder();
    String[] getDependencies();
}
