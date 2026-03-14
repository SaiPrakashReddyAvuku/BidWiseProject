package com.bidwise.backend.controller.admin;

import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.dispute.DisputeResponse;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.dto.user.UserResponse;
import com.bidwise.backend.entity.enums.DisputeStatus;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.service.ProjectService;
import com.bidwise.backend.service.TrustService;
import com.bidwise.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final TrustService trustService;
    private final ProjectService projectService;

    @GetMapping("/users")
    public PageResponse<UserResponse> users(@RequestParam(required = false) UserRole role,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return userService.list(role, page, size);
    }

    @PatchMapping("/users/{id}/block")
    public UserResponse block(@PathVariable UUID id) {
        return userService.block(id);
    }

    @PatchMapping("/users/{id}/verify")
    public UserResponse verify(@PathVariable UUID id) {
        return userService.verify(id);
    }

    @GetMapping("/disputes")
    public PageResponse<DisputeResponse> disputes(@RequestParam(required = false) DisputeStatus status,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        return trustService.getDisputes(status, page, size);
    }

    @GetMapping("/projects")
    public PageResponse<ProjectResponse> projects(@RequestParam(required = false) ProjectStatus status,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        return projectService.listProjects(status, null, page, size);
    }

    @PatchMapping("/disputes/{id}/resolve")
    public DisputeResponse resolveDispute(@PathVariable UUID id) {
        return trustService.resolveDispute(id);
    }
}


