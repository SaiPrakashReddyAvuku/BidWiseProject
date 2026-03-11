package com.bidwise.backend.repository;

import com.bidwise.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("""
            select m from Message m
            where (m.fromUserId = :userA and m.toUserId = :userB)
               or (m.fromUserId = :userB and m.toUserId = :userA)
            order by m.createdAt asc
            """)
    List<Message> findConversation(@Param("userA") UUID userA, @Param("userB") UUID userB);
}
