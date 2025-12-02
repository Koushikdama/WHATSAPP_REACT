# Missing Features and Integration Gaps Report

This document outlines the missing features and functionalities identified after analyzing the UI code (`social` folder) and Backend Microservices (`APPLICATION` folder).

## 1. Unified Conversation List (Critical)
**Issue:** The UI expects a unified list of conversations (both individual and group chats) to display in the main chat list.
**Current State:**
- **UI:** `api.ts` `getConversations` calls `GET /chats` and expects a list of all chats.
- **Backend:**
    - `ChatController` (`MessageService`) handles individual chats via `/api/chats`.
    - `GroupController` (`MessageService`) handles group chats via `/api/groups/user/{userId}/chats`.
**Missing:**
- A unified endpoint (e.g., `GET /api/conversations`) that returns both individual and group chats sorted by the last message timestamp.
- Alternatively, the UI needs to be updated to fetch from both endpoints and merge them client-side.

## 2. Call History (Missing Feature)
**Issue:** The UI has a "Calls" tab that expects a list of past calls.
**Current State:**
- **UI:** `api.ts` `getCalls` returns an empty array `[]` (mocked).
- **Backend:**
    - `NotificationController` handles *sending* call notifications (`/api/notifications/calls/incoming`).
    - There is **no controller or service** identified that stores and retrieves call history (`GET /calls`).
**Action Required:**
- Create a `CallHistoryService` (or add to `MessageService`).
- Implement `GET /api/calls` to return `Call[]` (incoming, outgoing, missed).

## 3. Notification History (Missing Feature)
**Issue:** The UI has a "Notifications" tab/feature.
**Current State:**
- **UI:** `api.ts` `getNotifications` returns an empty array `[]` (mocked).
- **Backend:**
    - `NotificationController` handles *sending* push/hybrid notifications.
    - There is **no endpoint** to retrieve a persistent history of notifications (`GET /api/notifications`).
**Action Required:**
- Implement a persistence layer for notifications.
- Add `GET /api/notifications/history` endpoint.

## 4. Status Service Integration
**Issue:** The UI is currently using Firebase directly for Status updates, but a Backend `StatusService` exists.
**Current State:**
- **UI:** `api.ts` uses `getFirebaseStatuses` from `status.service.ts`.
- **Backend:** `StatusController` exists with full CRUD capabilities (`/api/status/create`, `/api/status/contacts`, etc.).
**Action Required:**
- Update UI `api.ts` to use `StatusController` endpoints instead of Firebase SDK directly.
- Ensure `StatusController` returns data in the format expected by `Status` interface in `types.ts`.

## 5. User Presence/Online Status
**Issue:** Real-time online status synchronization.
**Current State:**
- **UI:** Expects `isOnline` in `User` object.
- **Backend:** `UserController` has `PATCH /users/{id}/presence` and `UserResponse` has `isOnline`. `NotificationController` also has session management (`/session/online`, `/session/offline`).
**Action Required:**
- Ensure the `UserController` presence logic is integrated with the `NotificationController`'s Redis-based session management to provide accurate real-time status.

## 6. Group Chat API Discrepancies
**Issue:** UI expects specific fields for groups.
**Current State:**
- **UI:** `GroupInfo` interface expects `members` as a map/record.
- **Backend:** `GroupController` returns `GroupResponseDTO`.
**Action Required:**
- Verify `GroupResponseDTO` maps correctly to `GroupInfo` in `types.ts`.
- Ensure `GET /api/groups/{groupId}/messages` returns messages in the format expected by `Message` interface.

## Summary of Missing Files/Classes to Create:
1.  **CallController.java** (and Service/Repository/DTOs) - For Call History.
2.  **NotificationHistoryController.java** (or add to existing) - For Notification History.
3.  **ConversationController.java** (Optional but recommended) - To aggregate Chats and Groups.
