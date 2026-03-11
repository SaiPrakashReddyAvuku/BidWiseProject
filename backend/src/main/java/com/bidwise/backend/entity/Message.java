package com.bidwise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_message_from_to", columnList = "fromUserId,toUserId")
})
public class Message extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID fromUserId;

    @Column(nullable = false)
    private UUID toUserId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(length = 255)
    private String attachment;
}
