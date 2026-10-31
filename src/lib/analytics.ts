"use client";

import posthog from "posthog-js";
import { initPostHog } from "@/lib/posthog-client";

/**
 * Every product event the browser sends to PostHog, with its properties.
 * Names are snake_case `object_verb` in the past tense; properties camelCase.
 *
 * Fire an event once the action has worked (in onSuccess, after the await),
 * not when the button is pressed, so the numbers count what really happened.
 * Never put note or comment text, emails, passwords or other personal data
 * in properties: ids, slugs, counts and enums only.
 *
 * Login events live in src/app/auth/lib/loginTelemetry.ts; subscription
 * lifecycle events are sent by the Stripe webhook (trackServerEvent).
 */
export type AnalyticsEvents = {
  // Sign-up and account
  signup_attempted: { method: SignupMethod };
  signup_code_sent: Record<string, never>;
  signup_code_verified: Record<string, never>;
  signup_failed: { method: SignupMethod; stage: SignupStage; reason: string };
  signed_up: { method?: SignupMethod };
  /** The welcome week (seven days of premium) started on this sign-in. `firstSteps`: no study or session yet. */
  welcome_premium_started: { firstSteps: boolean };
  username_chosen: { source: "sign_up" | "complete_profile" };
  password_reset_requested: Record<string, never>;
  password_reset_completed: Record<string, never>;
  password_reset_failed: { stage: "send_code" | "verify_code" | "set_password"; reason: string };
  logged_out: Record<string, never>;
  /** The first-visit questions (/welcome). `again`: changing earlier answers. */
  onboarding_completed: { familiarity: string; depth: string; time: string; interests: number; note: boolean; again: boolean };
  onboarding_skipped: { at: string };

  // Profile and settings
  profile_updated: { changedName: boolean; changedUsername: boolean; changedCountry: boolean };
  avatar_uploaded: Record<string, never>;
  email_reminders_toggled: { enabled: boolean };
  language_changed: { locale: string; from?: string; bible_follows?: boolean; bible_moved?: boolean };
  bible_follows_language_changed: { follows: boolean };
  bible_language_notice_action: { action: "read_default" | "keep"; bible: string; locale: string };
  theme_changed: { theme: string };
  default_bible_set: { bibleId: string; source: string };

  // Studies and sessions
  /** Built in the study builder: in conversation with the AI ("builder") or by hand ("builder_manual"). */
  study_created: { studyId?: string; source: "builder" | "builder_manual"; length: number; depth: number; steps: number };
  global_study_adopted: { slug: string; kind: string; created: boolean };
  study_edited: { studyId: string; mode: string | null; steps: number };
  study_deleted: { studyId: string; source: "study_list" | "study_detail" };
  study_regenerated: { studyId: string; stepCount?: number };
  session_started: { studyId?: string; sessionId: string; source: "study_list" | "study_detail" };
  session_deleted: { sessionId: string };
  step_completed: { sessionId: string; stepId: string; mode: string; stepKind?: string; stepIndex: number; isFirstStep: boolean };
  session_completed: { sessionId: string; studyId?: string };
  /** Read, type or listen, switched in the reader or the session player. */
  reading_mode_changed: { mode: string };

  // Reading and progress
  /** A newly recorded pass (`lap`); repeats inside the server's cooldown aren't sent. */
  chapter_completed: { bookAbbreviation: string; chapter: number; bibleId?: string; method: string; lap: number };
  /** scope: across all translations, or within the one being read. */
  badge_earned: { badge: string; scope: "all" | "bible" };
  verse_of_the_day_read: Record<string, never>;
  /** A word selected in the reader; alignmentTier is null when no original-language match was found. */
  word_looked_up: { lang?: string; bibleVersion?: string; foundInDictionary: boolean; alignmentTier: string | null };
  /** The person pressed play (not each track the queue advances to). */
  audio_played: { source: "listen_mode" | "global_player"; bibleId?: string };
  audio_downloaded: Record<string, never>;
  /** AI overview of a Bible person, generated on a signed-in visit. */
  person_content_generated: { entityId: string; status: "ready" | "failed" | "timed_out" };
  person_content_flagged: { section: string };
  /** All translations ("all") or one translation's slug, on the journey page. */
  journey_scope_changed: { scope: string };

  // Notes
  note_created: { source: "reader" | "notes_page"; scope?: string };
  note_updated: { source: "reader" | "notes_page" };
  note_deleted: { source: "reader" | "notes_page" };

  // Community
  contribution_posted: { kind: string; on: "entity" | "scripture" };
  comment_posted: { isReply: boolean };
  /** 1 up, -1 down, 0 cleared. */
  community_voted: { value: number; targetType: string };
  community_flagged: { targetType?: string };
  community_deleted: { targetType?: string };
  /** One event per filter changed; author ids are sent only as "set"/"cleared". */
  community_feed_filtered: { filter: string; value: string };

  // Sharing
  journey_visibility_changed: { isPublic: boolean };
  journey_shared: { method: ShareMethod };
  verse_shared: { method: ShareMethod; what: "link" | "text"; scope: string };
  story_image_shared: { source: string; method: ShareMethod };

  // Money
  paywall_shown: Record<string, never>;
  checkout_started: { source: "subscription_page" | "upgrade_modal"; billingInterval: BillingInterval };
  subscription_success: { sessionId: string };
  billing_portal_opened: { source: "subscription_page" | "trial_banner" };
  gift_checkout_started: {
    source: "gift_page" | "sponsorship";
    billingInterval: BillingInterval;
    /** email: to someone's address; queue: to a person waiting for a sponsor. */
    recipient: "email" | "queue";
  };
  gift_claimed: Record<string, never>;
  sponsorship_requested: Record<string, never>;
  sponsorship_request_cancelled: Record<string, never>;
};

export type AnalyticsEvent = keyof AnalyticsEvents;
export type SignupMethod = "password" | "google";
export type BillingInterval = "month" | "year";
export type SignupStage = "create" | "verify_code" | "username" | "google_redirect";
/** copy: to the clipboard; native: the system share sheet; download: saved as a file. */
export type ShareMethod = "copy" | "native" | "download";

/** Sends a product event. No-ops when PostHog isn't configured (local dev, tests). */
export function track<E extends AnalyticsEvent>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
): void {
  if (!initPostHog()) return;
  posthog.capture(event, properties);
}
