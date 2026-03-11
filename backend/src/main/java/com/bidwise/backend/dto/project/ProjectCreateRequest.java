package com.bidwise.backend.dto.project;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record ProjectCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotNull @Positive Double budget,
        @NotBlank @Size(max = 80) String category,
        @NotNull @FutureOrPresent LocalDate deadline,
        @Size(max = 100) String location,
        List<String> attachments
) {
}
