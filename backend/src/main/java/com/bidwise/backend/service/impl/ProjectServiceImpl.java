package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.bid.BidPlaceRequest;
import com.bidwise.backend.dto.bid.BidResponse;
import com.bidwise.backend.dto.common.PageResponse;
import com.bidwise.backend.dto.contract.ContractResponse;
import com.bidwise.backend.dto.project.ProjectCreateRequest;
import com.bidwise.backend.dto.project.ProjectResponse;
import com.bidwise.backend.entity.Bid;
import com.bidwise.backend.entity.Contract;
import com.bidwise.backend.entity.Notification;
import com.bidwise.backend.entity.Order;
import com.bidwise.backend.entity.Project;
import com.bidwise.backend.entity.enums.BidStatus;
import com.bidwise.backend.entity.enums.NotificationType;
import com.bidwise.backend.entity.enums.OrderStatus;
import com.bidwise.backend.entity.enums.PaymentStatus;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.exception.ConflictException;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.exception.UnauthorizedException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.BidRepository;
import com.bidwise.backend.repository.ContractRepository;
import com.bidwise.backend.repository.NotificationRepository;
import com.bidwise.backend.repository.OrderRepository;
import com.bidwise.backend.repository.ProjectRepository;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.service.EmailService;
import com.bidwise.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public ProjectResponse createProject(String buyerEmail, ProjectCreateRequest request) {
        var buyer = userRepository.findByEmailIgnoreCase(buyerEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (buyer.getRole() != UserRole.BUYER) {
            throw new UnauthorizedException("Only buyer accounts can create projects");
        }

        Project project = Project.builder()
                .buyerId(buyer.getId())
                .title(request.title())
                .description(request.description())
                .budget(request.budget())
                .category(request.category())
                .deadline(request.deadline())
                .location(request.location())
                .attachments(request.attachments() == null ? List.of() : request.attachments())
                .status(ProjectStatus.OPEN)
                .build();

        Project saved = projectRepository.save(project);
        return toProjectResponse(saved);
    }

    @Override
    @Transactional
    public PageResponse<ProjectResponse> listBuyerProjects(String buyerEmail, ProjectStatus status, int page, int size) {
        var buyer = userRepository.findByEmailIgnoreCase(buyerEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (buyer.getRole() != UserRole.BUYER) {
            throw new UnauthorizedException("Only buyer accounts can view buyer projects");
        }

        return listProjects(status, buyer.getId(), page, size);
    }

    @Override
    @Transactional
    public PageResponse<ProjectResponse> listProjects(ProjectStatus status, UUID buyerId, int page, int size) {
        var pageable = PageRequest.of(page, size);

        var projects = buyerId != null
                ? projectRepository.findAllByBuyerId(buyerId, pageable)
                : status != null
                ? projectRepository.findAllByStatus(status, pageable)
                : projectRepository.findAll(pageable);

        var mapped = projects.map(project -> {
            backfillCompletedState(project);
            return toProjectResponse(project);
        });
        return PageMapper.map(mapped);
    }

    @Override
    @Transactional
    public ProjectResponse getProject(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        backfillCompletedState(project);
        return toProjectResponse(project);
    }

    @Override
    @Transactional
    public BidResponse placeBid(BidPlaceRequest request) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new NotFoundException("Project not found: " + request.projectId()));

        Bid bid = Bid.builder()
                .projectId(request.projectId())
                .sellerId(request.sellerId())
                .price(request.price())
                .deliveryDays(request.deliveryDays())
                .proposal(request.proposal())
                .status(BidStatus.PENDING)
                .build();

        Bid saved = bidRepository.save(bid);

        notificationRepository.save(Notification.builder()
                .userId(project.getBuyerId())
                .title("New bid received")
                .message("A seller placed a new bid on " + project.getTitle())
                .type(NotificationType.BID)
                .isRead(false)
                .build());

        return DtoMapper.toBidResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidResponse> getProjectBids(UUID projectId) {
        return bidRepository.findAllByProjectId(projectId).stream()
                .map(DtoMapper::toBidResponse)
                .toList();
    }

    @Override
    @Transactional
    public ContractResponse acceptBid(UUID projectId, UUID bidId, String buyerEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));

        var buyer = userRepository.findByEmailIgnoreCase(buyerEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (buyer.getRole() != UserRole.BUYER) {
            throw new UnauthorizedException("Only buyer accounts can accept bids");
        }

        if (!project.getBuyerId().equals(buyer.getId())) {
            throw new UnauthorizedException("Only the project owner can accept bids");
        }

        Bid selectedBid = bidRepository.findById(bidId)
                .orElseThrow(() -> new NotFoundException("Bid not found: " + bidId));

        if (!selectedBid.getProjectId().equals(projectId)) {
            throw new NotFoundException("Bid does not belong to project");
        }

        var existingProjectOrder = orderRepository.findByProjectId(projectId);
        if (existingProjectOrder.isPresent()) {
            Order order = existingProjectOrder.get();
            if (order.getBidId().equals(bidId)) {
                ensureProjectStatusFromOrder(project, order);
                return DtoMapper.toContractResponse(contractRepository.findByBidId(bidId)
                        .orElseThrow(() -> new ConflictException("Accepted bid is missing a contract")));
            }
            throw new ConflictException("A bid has already been accepted for this project");
        }

        var existingBidOrder = orderRepository.findByBidId(bidId);
        if (existingBidOrder.isPresent()) {
            Order order = existingBidOrder.get();
            ensureProjectStatusFromOrder(project, order);
            return DtoMapper.toContractResponse(contractRepository.findByBidId(bidId)
                    .orElseThrow(() -> new ConflictException("Accepted bid is missing a contract")));
        }

        if (selectedBid.getStatus() != BidStatus.PENDING) {
            throw new ConflictException("Only pending bids can be accepted");
        }

        List<Bid> projectBids = bidRepository.findAllByProjectId(projectId);
        for (Bid bid : projectBids) {
            bid.setStatus(bid.getId().equals(bidId) ? BidStatus.ACCEPTED : BidStatus.REJECTED);
        }

        project.setStatus(ProjectStatus.IN_PROGRESS);

        Contract contract = contractRepository.save(Contract.builder()
                .bidId(selectedBid.getId())
                .projectId(projectId)
                .buyerId(project.getBuyerId())
                .sellerId(selectedBid.getSellerId())
                .paymentStatus(PaymentStatus.PENDING)
                .progress(0)
                .build());

        Order order = orderRepository.save(Order.builder()
                .bidId(selectedBid.getId())
                .projectId(projectId)
                .buyerId(project.getBuyerId())
                .sellerId(selectedBid.getSellerId())
                .price(BigDecimal.valueOf(selectedBid.getPrice()))
                .status(OrderStatus.CREATED)
                .build());

        notificationRepository.save(Notification.builder()
                .userId(selectedBid.getSellerId())
                .title("Bid accepted")
                .message("Your bid for project " + project.getTitle() + " was accepted. Order " + order.getId() + " created.")
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .userId(project.getBuyerId())
                .title("Order created")
                .message("Order " + order.getId() + " was created for project " + project.getTitle())
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        userRepository.findById(selectedBid.getSellerId()).ifPresent(seller ->
                emailService.sendEmail(seller.getEmail(), "Bid accepted", "Your bid was accepted. Order " + order.getId() + " is created.")
        );

        return DtoMapper.toContractResponse(contract);
    }

    private void backfillCompletedState(Project project) {
        var order = orderRepository.findByProjectId(project.getId());
        if (order.isPresent()) {
            ensureProjectStatusFromOrder(project, order.get());
            return;
        }

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            return;
        }

        if (isDeadlinePassed(project) && !hasAcceptedBid(project.getId())) {
            project.setStatus(ProjectStatus.COMPLETED);
        }
    }

    private void ensureProjectStatusFromOrder(Project project, Order order) {
        if (order.getStatus() == OrderStatus.COMPLETED) {
            project.setStatus(ProjectStatus.COMPLETED);
        } else {
            project.setStatus(ProjectStatus.IN_PROGRESS);
        }
    }

    @Override
    @Transactional
    public BidResponse rejectBid(UUID projectId, UUID bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new NotFoundException("Bid not found: " + bidId));

        if (!bid.getProjectId().equals(projectId)) {
            throw new NotFoundException("Bid does not belong to project");
        }

        bid.setStatus(BidStatus.REJECTED);
        return DtoMapper.toBidResponse(bid);
    }

    @Override
    @Transactional
    public ProjectResponse completeProject(UUID projectId, String buyerEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));

        var buyer = userRepository.findByEmailIgnoreCase(buyerEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (buyer.getRole() != UserRole.BUYER) {
            throw new UnauthorizedException("Only buyer accounts can complete projects");
        }

        if (!project.getBuyerId().equals(buyer.getId())) {
            throw new UnauthorizedException("Only the project owner can complete the project");
        }

        Order order = orderRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ConflictException("No order exists for this project"));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            project.setStatus(ProjectStatus.COMPLETED);
            return toProjectResponse(project);
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ConflictException("Order must be delivered before completing the project");
        }

        order.setStatus(OrderStatus.COMPLETED);
        project.setStatus(ProjectStatus.COMPLETED);

        contractRepository.findByProjectId(projectId)
                .ifPresent(contract -> contract.setProgress(100));

        bidRepository.findAllByProjectId(projectId).stream()
                .filter(bid -> bid.getStatus() == BidStatus.ACCEPTED)
                .findFirst()
                .ifPresent(acceptedBid -> notificationRepository.save(Notification.builder()
                        .userId(acceptedBid.getSellerId())
                        .title("Project completed")
                        .message("Buyer confirmed delivery and completed project " + project.getTitle())
                        .type(NotificationType.PROJECT)
                        .isRead(false)
                        .build()));

        backfillCompletedState(project);
        return toProjectResponse(project);
    }

    private ProjectResponse toProjectResponse(Project project) {
        long bidsCount = bidRepository.countByProjectId(project.getId());
        String closureReason = resolveClosureReason(project);
        return DtoMapper.toProjectResponse(project, bidsCount, closureReason);
    }

    private String resolveClosureReason(Project project) {
        if (project.getStatus() != ProjectStatus.COMPLETED) {
            return null;
        }

        if (isDeadlinePassed(project) && !hasAcceptedBid(project.getId())) {
            return "No bid accepted before deadline";
        }

        return null;
    }

    private boolean isDeadlinePassed(Project project) {
        return project.getDeadline() != null && project.getDeadline().isBefore(LocalDate.now());
    }

    private boolean hasAcceptedBid(UUID projectId) {
        return bidRepository.existsByProjectIdAndStatus(projectId, BidStatus.ACCEPTED);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BidResponse> getSellerBids(UUID sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var bids = bidRepository.findAllBySellerId(sellerId, pageable).map(DtoMapper::toBidResponse);
        return PageMapper.map(bids);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ContractResponse> getContractsForUser(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var contracts = contractRepository
                .findAllByBuyerIdOrSellerId(userId, userId, pageable)
                .map(DtoMapper::toContractResponse);
        return PageMapper.map(contracts);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContract(UUID contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new NotFoundException("Contract not found: " + contractId));
        return DtoMapper.toContractResponse(contract);
    }
}





