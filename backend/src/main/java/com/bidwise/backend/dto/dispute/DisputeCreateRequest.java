package com.bidwise.backend.dto.dispute;

import com.bidwise.backend.entity.enums.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DisputeCreateRequest(
        @NotNull UUID projectId,
        @NotNull UUID raisedBy,
        @NotNull UUID against,
        @NotBlank String reason
) {
}
