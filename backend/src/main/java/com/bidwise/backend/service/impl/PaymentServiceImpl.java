package com.bidwise.backend.service.impl;

import com.bidwise.backend.dto.payment.PaymentIntentRequest;
import com.bidwise.backend.dto.payment.PaymentIntentResponse;
import com.bidwise.backend.entity.Notification;
import com.bidwise.backend.entity.Order;
import com.bidwise.backend.entity.Payment;
import com.bidwise.backend.entity.UserEntity;
import com.bidwise.backend.entity.enums.NotificationType;
import com.bidwise.backend.entity.enums.PaymentStatus;
import com.bidwise.backend.exception.NotFoundException;
import com.bidwise.backend.exception.UnauthorizedException;
import com.bidwise.backend.repository.NotificationRepository;
import com.bidwise.backend.repository.OrderRepository;
import com.bidwise.backend.repository.PaymentRepository;
import com.bidwise.backend.repository.UserRepository;
import com.bidwise.backend.service.EmailService;
import com.bidwise.backend.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Value("${stripe.api-key:}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    @Override
    @Transactional
    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request, String buyerEmail) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new NotFoundException("Order not found: " + request.orderId()));

        UserEntity buyer = userRepository.findByEmailIgnoreCase(buyerEmail)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));

        if (!order.getBuyerId().equals(buyer.getId())) {
            throw new UnauthorizedException("Only the buyer can create a payment intent");
        }

        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            throw new IllegalStateException("Stripe API key is not configured");
        }

        Stripe.apiKey = stripeApiKey;
        long amountInCents = order.getPrice()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("orderId", order.getId().toString())
                .build();

        try {
            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Payment payment = paymentRepository.findByOrderId(order.getId())
                    .orElseGet(() -> Payment.builder()
                            .orderId(order.getId())
                            .buyerId(order.getBuyerId())
                            .sellerId(order.getSellerId())
                            .amount(order.getPrice())
                            .status(PaymentStatus.PENDING)
                            .build());
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);

            return new PaymentIntentResponse(paymentIntent.getClientSecret());
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to create Stripe payment intent", ex);
        }
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        Event event = constructEvent(payload, signatureHeader);
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);
            if (paymentIntent != null) {
                updatePaymentStatus(paymentIntent.getId(), PaymentStatus.PAID);
            }
        }

        if ("payment_intent.payment_failed".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject()
                    .orElse(null);
            if (paymentIntent != null) {
                updatePaymentStatus(paymentIntent.getId(), PaymentStatus.FAILED);
            }
        }
    }

    private Event constructEvent(String payload, String signatureHeader) {
        if (stripeWebhookSecret == null || stripeWebhookSecret.isBlank()) {
            try {
                return Event.GSON.fromJson(payload, Event.class);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid Stripe webhook payload", ex);
            }
        }

        try {
            return Webhook.constructEvent(payload, signatureHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException ex) {
            throw new IllegalArgumentException("Invalid Stripe signature", ex);
        }
    }

    private void updatePaymentStatus(String paymentIntentId, PaymentStatus status) {
        Optional<Payment> paymentOpt = paymentRepository.findByStripePaymentIntentId(paymentIntentId);
        if (paymentOpt.isEmpty()) {
            return;
        }

        Payment payment = paymentOpt.get();
        payment.setStatus(status);

        if (status == PaymentStatus.PAID) {
            notificationRepository.save(Notification.builder()
                    .userId(payment.getSellerId())
                    .title("Payment completed")
                    .message("Payment for your order has been confirmed.")
                    .type(NotificationType.SYSTEM)
                    .isRead(false)
                    .build());

            userRepository.findById(payment.getSellerId()).ifPresent(seller ->
                    emailService.sendEmail(seller.getEmail(), "Payment confirmed", "Payment for your order has been confirmed.")
            );
        }
    }
}
