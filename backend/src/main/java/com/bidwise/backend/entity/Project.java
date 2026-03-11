package com.bidwise.backend.entity;

import com.bidwise.backend.entity.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_project_buyer", columnList = "buyerId"),
        @Index(name = "idx_project_status", columnList = "status")
})
public class Project extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID buyerId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private Double budget;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(length = 100)
    private String location;

    @ElementCollection
    @CollectionTable(name = "project_attachments", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "attachment", length = 255)
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private ProjectStatus status;
}
