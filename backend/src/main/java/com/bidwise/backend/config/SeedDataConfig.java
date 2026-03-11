package com.bidwise.backend.config;

import com.bidwise.backend.entity.*;
import com.bidwise.backend.entity.enums.*;
import com.bidwise.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            BidRepository bidRepository,
            NotificationRepository notificationRepository,
            ReviewRepository reviewRepository,
            DisputeRepository disputeRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            String encodedPassword = passwordEncoder.encode("password");

            UserEntity buyer = userRepository.save(UserEntity.builder()
                    .name("Olivia Carter")
                    .email("buyer@bidwise.com")
                    .passwordHash(encodedPassword)
                    .role(UserRole.BUYER)
                    .companyName("NorthPeak Retail")
                    .phone("+1-555-0100")
                    .blocked(false)
                    .verified(true)
                    .rating(4.7)
                    .build());

            UserEntity sellerA = userRepository.save(UserEntity.builder()
                    .name("Vendor A")
                    .email("seller@bidwise.com")
                    .passwordHash(encodedPassword)
                    .role(UserRole.SELLER)
                    .companyName("Ava Digital Studio")
                    .skills(List.of("React", "UX Design", "API Integration"))
                    .blocked(false)
                    .verified(true)
                    .rating(4.9)
                    .build());

            UserEntity sellerB = userRepository.save(UserEntity.builder()
                    .name("Vendor B")
                    .email("seller2@bidwise.com")
                    .passwordHash(encodedPassword)
                    .role(UserRole.SELLER)
                    .companyName("Liam Systems")
                    .skills(List.of("Next.js", "Node.js", "Cloud"))
                    .blocked(false)
                    .verified(true)
                    .rating(4.6)
                    .build());

            userRepository.save(UserEntity.builder()
                    .name("Admin Team")
                    .email("admin@bidwise.com")
                    .passwordHash(encodedPassword)
                    .role(UserRole.ADMIN)
                    .blocked(false)
                    .verified(true)
                    .rating(5.0)
                    .build());

            Project project = projectRepository.save(Project.builder()
                    .buyerId(buyer.getId())
                    .title("E-commerce Checkout Optimization")
                    .description("Improve checkout flow and reduce cart abandonment")
                    .budget(12000.0)
                    .category("Web Development")
                    .deadline(LocalDate.now().plusDays(30))
                    .location("Remote")
                    .attachments(List.of("checkout-spec.pdf", "analytics.csv"))
                    .status(ProjectStatus.OPEN)
                    .build());

            bidRepository.save(Bid.builder()
                    .projectId(project.getId())
                    .sellerId(sellerA.getId())
                    .price(9000.0)
                    .deliveryDays(21)
                    .proposal("Delivery with conversion and funnel optimization")
                    .status(BidStatus.PENDING)
                    .build());

            bidRepository.save(Bid.builder()
                    .projectId(project.getId())
                    .sellerId(sellerB.getId())
                    .price(8500.0)
                    .deliveryDays(19)
                    .proposal("Fast delivery and A/B experimentation support")
                    .status(BidStatus.PENDING)
                    .build());

            notificationRepository.save(Notification.builder()
                    .userId(buyer.getId())
                    .title("New bid received")
                    .message("A new bid was placed on your project")
                    .type(NotificationType.BID)
                    .isRead(false)
                    .build());

            reviewRepository.save(Review.builder()
                    .fromUserId(buyer.getId())
                    .toUserId(sellerA.getId())
                    .rating(5)
                    .comment("Great communication and delivery")
                    .build());

            disputeRepository.save(Dispute.builder()
                    .projectId(project.getId())
                    .raisedBy(buyer.getId())
                    .against(sellerB.getId())
                    .reason("Scope misunderstanding")
                    .status(DisputeStatus.OPEN)
                    .build());
        };
    }
}
