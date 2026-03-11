package com.bidwise.backend.controller.buyer;

import com.bidwise.backend.dto.bid.BidResponse;
import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.contract.ContractResponse;
import com.bidwise.backend.dto.project.ProjectCreateRequest;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/buyer")
public class BuyerController {

    private final ProjectService projectService;

    @PostMapping("/projects")
    public ProjectResponse createProject(Authentication authentication,
                                         @Valid @RequestBody ProjectCreateRequest request) {
        return projectService.createProject(authentication.getName(), request);
    }

    @GetMapping("/projects")
    public PageResponse<ProjectResponse> projects(@RequestParam(required = false) ProjectStatus status,
                                                  @RequestParam(required = false) UUID buyerId,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        return projectService.listProjects(status, buyerId, page, size);
    }

    @GetMapping("/projects/{projectId}")
    public ProjectResponse project(@PathVariable UUID projectId) {
        return projectService.getProject(projectId);
    }

    @GetMapping("/projects/{projectId}/bids")
    public List<BidResponse> bids(@PathVariable UUID projectId) {
        return projectService.getProjectBids(projectId);
    }

    @PatchMapping("/projects/{projectId}/bids/{bidId}/accept")
    public ContractResponse acceptBid(@PathVariable UUID projectId, @PathVariable UUID bidId) {
        return projectService.acceptBid(projectId, bidId);
    }

    @PatchMapping("/projects/{projectId}/bids/{bidId}/reject")
    public BidResponse rejectBid(@PathVariable UUID projectId, @PathVariable UUID bidId) {
        return projectService.rejectBid(projectId, bidId);
    }
}
