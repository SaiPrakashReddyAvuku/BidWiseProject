package com.bidwise.backend.config;

import com.bidwise.backend.entity.Bid;
import com.bidwise.backend.entity.Project;
import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.BidStatus;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.repository.BidRepository;
import com.bidwise.backend.repository.ProjectRepository;
import com.bidwise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        UserEntity buyer = userRepository.save(UserEntity.builder()
                .name("Olivia Carter")
                .email("buyer@bidwise.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(UserRole.BUYER)
                .phone("555-0101")
                .companyName("BlueWave Commerce")
                .blocked(false)
                .verified(true)
                .rating(4.6)
                .skills(List.of("e-commerce", "growth"))
                .build());

        UserEntity seller = userRepository.save(UserEntity.builder()
                .name("Vendor A")
                .email("seller@bidwise.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(UserRole.SELLER)
                .phone("555-0102")
                .companyName("BrightStack Labs")
                .blocked(false)
                .verified(true)
                .rating(4.7)
                .skills(List.of("react", "stripe", "ux"))
                .build());

        userRepository.save(UserEntity.builder()
                .name("BidWise Admin")
                .email("admin@bidwise.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(UserRole.ADMIN)
                .blocked(false)
                .verified(true)
                .build());

        Project project = projectRepository.save(Project.builder()
                .buyerId(buyer.getId())
                .title("E-commerce Checkout Optimization")
                .description("Improve checkout flow and reduce cart abandonment.")
                .budget(12000.0)
                .category("Web Development")
                .deadline(LocalDate.now().plusDays(30))
                .location("Remote")
                .attachments(List.of("checkout-spec.pdf", "analytics.csv"))
                .status(ProjectStatus.OPEN)
                .build());

        bidRepository.save(Bid.builder()
                .projectId(project.getId())
                .sellerId(seller.getId())
                .price(8500.0)
                .deliveryDays(19)
                .proposal("We will streamline checkout steps and optimize payment flow.")
                .status(BidStatus.PENDING)
                .build());
    }
}
