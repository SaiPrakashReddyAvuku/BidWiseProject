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
import com.bidwise.backend.entity.Project;
import com.bidwise.backend.entity.enums.BidStatus;
import com.bidwise.backend.entity.enums.NotificationType;
import com.bidwise.backend.entity.enums.PaymentStatus;
import com.bidwise.backend.entity.enums.ProjectStatus;
import com.bidwise.backend.entity.enums.UserRole;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.exception.UnauthorizedException;
import com.bidwise.backend.mapper.DtoMapper;
import com.bidwise.backend.repository.BidRepository;
import com.bidwise.backend.repository.ContractRepository;
import com.bidwise.backend.repository.NotificationRepository;
import com.bidwise.backend.repository.ProjectRepository;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

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
        return DtoMapper.toProjectResponse(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProjectResponse> listProjects(ProjectStatus status, UUID buyerId, int page, int size) {
        var pageable = PageRequest.of(page, size);

        var projects = buyerId != null
                ? projectRepository.findAllByBuyerId(buyerId, pageable)
                : status != null
                ? projectRepository.findAllByStatus(status, pageable)
                : projectRepository.findAll(pageable);

        var mapped = projects.map(project -> DtoMapper.toProjectResponse(project, bidRepository.countByProjectId(project.getId())));
        return PageMapper.map(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        return DtoMapper.toProjectResponse(project, bidRepository.countByProjectId(projectId));
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
    public ContractResponse acceptBid(UUID projectId, UUID bidId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));

        Bid accepted = bidRepository.findById(bidId)
                .orElseThrow(() -> new NotFoundException("Bid not found: " + bidId));

        if (!accepted.getProjectId().equals(projectId)) {
            throw new NotFoundException("Bid does not belong to project");
        }

        List<Bid> projectBids = bidRepository.findAllByProjectId(projectId);
        for (Bid bid : projectBids) {
            bid.setStatus(bid.getId().equals(bidId) ? BidStatus.ACCEPTED : BidStatus.REJECTED);
        }

        project.setStatus(ProjectStatus.IN_PROGRESS);

        Contract contract = contractRepository.save(Contract.builder()
                .bidId(accepted.getId())
                .projectId(projectId)
                .buyerId(project.getBuyerId())
                .sellerId(accepted.getSellerId())
                .paymentStatus(PaymentStatus.PENDING)
                .progress(0)
                .build());

        notificationRepository.save(Notification.builder()
                .userId(accepted.getSellerId())
                .title("Bid accepted")
                .message("Your bid for project " + project.getTitle() + " was accepted")
                .type(NotificationType.PROJECT)
                .isRead(false)
                .build());

        return DtoMapper.toContractResponse(contract);
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
    @Transactional(readOnly = true)
    public PageResponse<BidResponse> getSellerBids(UUID sellerId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        var bids = bidRepository.findAllBySellerId(sellerId, pageable).map(DtoMapper::toBidResponse);
        return PageMapper.map(bids);
    }
}
