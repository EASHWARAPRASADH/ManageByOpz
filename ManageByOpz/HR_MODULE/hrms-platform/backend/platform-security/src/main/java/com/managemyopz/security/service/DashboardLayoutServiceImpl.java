package com.managemyopz.security.service;

import com.managemyopz.security.dto.DashboardLayoutDto;
import com.managemyopz.security.dto.DashboardPreferenceDto;
import com.managemyopz.security.entity.DashboardLayout;
import com.managemyopz.security.entity.DashboardPreference;
import com.managemyopz.security.entity.DashboardWidget;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.DashboardLayoutRepository;
import com.managemyopz.security.repository.DashboardWidgetRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardLayoutServiceImpl implements DashboardLayoutService {

    private final UserRepository userRepository;
    private final DashboardLayoutRepository layoutRepository;
    private final DashboardWidgetRepository widgetRepository;

    @Override
    @Transactional
    public DashboardLayoutDto getActiveLayoutForUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new PlatformException("User not found: " + username, HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        Optional<DashboardLayout> optLayout = layoutRepository.findByUserIdAndActiveTrue(user.getId());
        if (optLayout.isPresent()) {
            return mapToDto(optLayout.get());
        }

        // Create default layout
        return createDefaultLayoutForUser(user);
    }

    @Override
    @Transactional
    public DashboardLayoutDto saveLayoutForUser(String username, DashboardLayoutDto layoutDto) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new PlatformException("User not found: " + username, HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        DashboardLayout layout = layoutRepository.findByUserIdAndActiveTrue(user.getId())
                .orElseGet(() -> {
                    DashboardLayout newLayout = new DashboardLayout();
                    newLayout.setUser(user);
                    newLayout.setTenantId(user.getTenantId());
                    newLayout.setActive(true);
                    return newLayout;
                });

        layout.setLayoutName(layoutDto.getLayoutName() != null ? layoutDto.getLayoutName() : "Default");
        
        // Remove existing preferences
        layout.getPreferences().clear();

        if (layoutDto.getWidgets() != null) {
            for (DashboardPreferenceDto prefDto : layoutDto.getWidgets()) {
                DashboardWidget widget = widgetRepository.findByWidgetKey(prefDto.getWidgetKey())
                        .orElseThrow(() -> new PlatformException("Widget key not found: " + prefDto.getWidgetKey(), HttpStatus.BAD_REQUEST, "WIDGET_NOT_FOUND"));

                DashboardPreference pref = new DashboardPreference();
                pref.setLayout(layout);
                pref.setWidget(widget);
                pref.setPositionX(prefDto.getX());
                pref.setPositionY(prefDto.getY());
                pref.setWidth(prefDto.getW());
                pref.setHeight(prefDto.getH());
                pref.setCustomTitle(prefDto.getTitle());
                pref.setVisible(prefDto.isVisible());
                pref.setTenantId(user.getTenantId());

                layout.getPreferences().add(pref);
            }
        }

        DashboardLayout saved = layoutRepository.save(layout);
        return mapToDto(saved);
    }

    private DashboardLayoutDto createDefaultLayoutForUser(User user) {
        DashboardLayout layout = new DashboardLayout();
        layout.setUser(user);
        layout.setTenantId(user.getTenantId());
        layout.setLayoutName("Default");
        layout.setActive(true);

        List<DashboardWidget> activeWidgets = widgetRepository.findAll().stream()
                .filter(DashboardWidget::isActive)
                .collect(Collectors.toList());

        int x = 0;
        int y = 0;
        int maxRowH = 0;

        for (DashboardWidget widget : activeWidgets) {
            // Check if widget fits in 8-grid row
            if (x + widget.getDefaultW() > 8) {
                x = 0;
                y += maxRowH;
                maxRowH = 0;
            }

            DashboardPreference pref = new DashboardPreference();
            pref.setLayout(layout);
            pref.setWidget(widget);
            pref.setPositionX(x);
            pref.setPositionY(y);
            pref.setWidth(widget.getDefaultW());
            pref.setHeight(widget.getDefaultH());
            pref.setCustomTitle(widget.getDefaultTitle());
            pref.setVisible(true);
            pref.setTenantId(user.getTenantId());

            layout.getPreferences().add(pref);

            x += widget.getDefaultW();
            maxRowH = Math.max(maxRowH, widget.getDefaultH());
        }

        DashboardLayout saved = layoutRepository.save(layout);
        return mapToDto(saved);
    }

    private DashboardLayoutDto mapToDto(DashboardLayout layout) {
        List<DashboardPreferenceDto> widgets = layout.getPreferences().stream()
                .map(pref -> new DashboardPreferenceDto(
                        pref.getWidget().getWidgetKey(),
                        pref.getWidget().getComponentName(),
                        pref.getCustomTitle() != null ? pref.getCustomTitle() : pref.getWidget().getDefaultTitle(),
                        pref.getPositionX(),
                        pref.getPositionY(),
                        pref.getWidth(),
                        pref.getHeight(),
                        pref.isVisible()
                ))
                .collect(Collectors.toList());

        return new DashboardLayoutDto(
                layout.getId(),
                layout.getLayoutName(),
                widgets
        );
    }
}
