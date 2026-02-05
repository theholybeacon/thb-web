UPDATE subscription s
SET "gifterId" = gs."gifterId",
    "giftSubscriptionId" = gs.id,
    "membershipRequestId" = gs."membershipRequestId"
FROM gift_subscription gs
WHERE gs."stripeSubscriptionId" = s."stripeSubscriptionId"
  AND gs.status = 'claimed'
  AND gs."stripeSubscriptionId" IS NOT NULL;
