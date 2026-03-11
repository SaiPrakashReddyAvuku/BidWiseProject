package com.bidwise.backend.controller.seller;

import com.bidwise.backend.dto.bid.BidPlaceRequest;
import com.bidwise.backend.dto.bid.BidResponse;
import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/seller")
public class SellerController {

    private final ProjectService projectService;

    @GetMapping("/projects")
    public PageResponse<ProjectResponse> openProjects(@RequestParam(required = false) ProjectStatus status,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        ProjectStatus applied = status == null ? ProjectStatus.OPEN : status;
        return projectService.listProjects(applied, null, page, size);
    }

    @PostMapping("/bids")
    public BidResponse placeBid(@Valid @RequestBody BidPlaceRequest request) {
        return projectService.placeBid(request);
    }

    @GetMapping("/bids")
    public PageResponse<BidResponse> myBids(@RequestParam UUID sellerId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return projectService.getSellerBids(sellerId, page, size);
    }
}

