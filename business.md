# Business Overview

Updated: 2026-03-13

This document summarizes the business role model for the WDP Eyewear web dashboard, the expected interaction constraints between roles, and the current frontend delivery status.

The product topic still uses five roles:

- `Customer`
- `Sales/Support Staff`
- `Operations Staff`
- `Manager`
- `System Admin`

The web repo in this phase is scoped to internal dashboards only, so the active web roles are:

- `Sales/Support Staff`
- `Operations Staff`
- `Manager`
- `System Admin`

For route compatibility, the dashboard still uses the legacy route groups `/sale/*` and `/operation/*`.

The key design principle is ownership:

- `Customer` remains part of the product scope, but customer-facing demo flows are owned by the mobile app repo.
- `Sales/Support Staff` owns customer-facing intake and customer communication.
- `Operations Staff` owns fulfillment and execution.
- `Manager` owns business rules, approvals, and performance control.
- `System Admin` owns platform, security, permissions, and system reliability.

## 1. Role Definitions

### 1.1 Sales/Support Staff

Mission:

- Own customer communication and order intake quality.

Primary responsibilities:

- Receive and validate new orders.
- Confirm customer identity, phone, address, payment intent, and order details.
- Follow up on missing customer data.
- Follow up on missing or unclear prescription data.
- Handle first-line customer service.
- Open and manage return/refund/support cases.
- Maintain customer records and customer-facing order notes.

Allowed actions:

- Confirm or reject orders at the intake stage.
- Update customer profile data.
- Add order notes and contact history.
- Trigger customer follow-up flows.
- Escalate exceptions to manager.

Not allowed:

- Modify physical stock directly.
- Override pricing or discount policy beyond allowed limits.
- Finalize fulfillment or logistics execution.
- Approve high-risk refunds or policy exceptions.

Input:

- Customer order request.
- Customer profile.
- Payment and address information.
- Prescription data or missing-data cases.

Output:

- A commercially valid order, ready for operations.
- A documented customer issue or escalation.

Representative frontend areas:

- `/sale/orders/pending`
- `/sale/orders/alerts`
- `/sale/orders/prescription-needed`
- `/sale/customers`
- `/sale/cases/returns`
- `/sale/cases/refunds`

### 1.2 Operations Staff

Mission:

- Own the execution lifecycle after an order is valid and ready to run.

Primary responsibilities:

- Ready-stock order execution: accept, pick, pack, ship, hand over.
- Pre-order inbound handling: batch linking, arrival, stock-in, packing.
- Prescription operations: review, complete, approve, send to processing.
- Processing and lab workflow.
- Inventory and stock adjustments.
- Shipping creation, tracking, carrier handover, COD reconciliation.

Allowed actions:

- Update fulfillment state.
- Assign operations owner.
- Hold an order for operational reasons.
- Update tracking and carrier information.
- Update stock through inventory workflow.
- Move order through packing, shipping, and processing steps.

Not allowed:

- Change commercial policy, discount, or general pricing rules.
- Change customer commercial commitments without escalation.
- Approve business exceptions outside operational authority.

Input:

- Clean order from staff.
- Approved prescription or prescription-ready case.
- Batch/inventory/shipping data.

Output:

- Fulfilled order.
- Operational issue requiring staff, manager, or admin escalation.

Representative frontend areas:

- `/operation/orders/ready-stock`
- `/operation/orders/preorder`
- `/operation/orders/prescription`
- `/operation/cases/warranties`
- `/operation/orders/processing`
- `/operation/shipping/*`
- `/operation/inventory/*`

### 1.3 Manager

Mission:

- Own business control, approvals, policies, pricing, and business performance.

Primary responsibilities:

- Product governance and catalog decisions.
- Pricing and discount governance.
- Business policy definition.
- User management for business roles.
- KPI, SLA, revenue, and exception oversight.
- Approval of high-risk or out-of-bound business actions.

Allowed actions:

- Approve or reject business exceptions.
- Change business rules.
- Control business-facing users and role allocations, subject to system policy.
- Review backlog, bottlenecks, revenue, and compliance.

Not allowed:

- Operate as day-to-day fulfillment owner.
- Perform system administration tasks such as secret management or auth infrastructure control.

Input:

- Escalations from sales/support staff and operations staff.
- Performance dashboards and business data.
- Product, pricing, discount, and policy change requests.

Output:

- Approved or rejected exception.
- Updated business rule.
- Business direction and workload prioritization.

Representative frontend areas:

- `/manager/dashboard`
- `/manager/products`
- `/manager/pricing`
- `/manager/discounts`
- `/manager/users`
- `/manager/policies`
- `/manager/revenue`
- `/manager/cases/support`

### 1.4 System Admin

Mission:

- Own the platform, security, identity, access control, integrations, and system reliability.

Primary responsibilities:

- Authentication and authorization platform.
- Role and permission infrastructure.
- Environment configuration, secret management, and integrations.
- Audit logs, incident handling, monitoring, backup, and recovery.
- System-level settings and access review.

Allowed actions:

- Create and maintain permissions and role policies.
- Lock accounts, rotate secrets, inspect logs, and manage integrations.
- Enable or disable system features and system access.

Not allowed:

- Perform normal business operations by default.
- Approve commercial exceptions as a substitute for manager authority.

Input:

- Security incidents.
- Access requests.
- Platform alerts.
- Integration and environment requirements.

Output:

- Stable and secure platform operation.
- Auditable system changes.

Representative frontend areas:

- Intended future area: `/admin/*`

Current status:

- Dedicated `/admin/*` pages now exist, but they are system-only.
- Legacy business paths under `/admin/refunds`, `/admin/reconciliation`, and `/admin/audit` are compatibility entries that redirect managers or block admins from business workflows.

## 2. Binding Rules Between Roles

The four roles must be linked by explicit ownership and approval rules.

### 2.1 Ownership Rules

- `Sales/Support Staff` owns customer data quality and customer-side clarification.
- `Operations Staff` owns item flow, inventory flow, lab flow, and logistics flow.
- `Manager` owns policy, pricing, exceptions, and approval thresholds.
- `System Admin` owns auth, permissions, secrets, system config, and auditability.

### 2.2 Handoff Rules

#### Sales/Support Staff -> Operations Staff

An order can only move from staff to operation when all minimum business requirements are satisfied:

- Customer identity is usable.
- Delivery address is usable.
- Payment state is acceptable for the order type.
- Ordered items are sufficiently specified.
- If prescription is required, the order is either complete enough for operations or clearly routed into prescription handling.

If these conditions are not met, the order remains with sales/support staff.

#### Operations Staff -> Sales/Support Staff

Operations staff returns an order to sales/support staff when the blocker depends on customer clarification, for example:

- Missing prescription values.
- Unclear prescription image.
- Customer confirmation needed.
- Delivery data mismatch.
- Payment or address re-confirmation needed.

#### Sales/Support Staff or Operations Staff -> Manager

Escalate to manager when the action exceeds normal authority, for example:

- Refund above threshold.
- Discount above threshold.
- Inventory override with business impact.
- Policy exception.
- High-value cancellation.
- SLA breach requiring special decision.

#### Manager -> System Admin

Escalate to system admin when the issue is no longer business-only:

- Permission or access issue.
- Auth/session/security issue.
- Deployment configuration problem.
- Secret, integration, or webhook problem.
- Audit or compliance review.

### 2.3 Separation of Duties

These rules should be enforced:

- The requester should not be the sole approver for high-risk actions.
- Business approvals belong to manager, not system admin.
- System configuration belongs to system admin, not manager.
- Sales/support staff should not directly update stock.
- Operations staff should not directly change commercial policy.

### 2.4 Audit Requirements

The following actions should be logged:

- Order confirmation and rejection.
- Prescription edits and approvals.
- Inventory adjustments.
- Shipment creation and carrier handover.
- Refund approvals and rejections.
- Discount and policy changes.
- User role and permission changes.
- Impersonation or emergency access by admin.

## 3. Suggested State Ownership Model

Suggested business ownership by state:

| State / Situation | Primary Owner | Secondary Owner | Notes |
| --- | --- | --- | --- |
| New order / waiting confirmation | Sales/Support Staff | Manager | Intake and validation stage |
| Waiting customer information | Sales/Support Staff | Operations Staff | Operations may request data; sales/support owns customer follow-up |
| Ready for fulfillment | Operations Staff | Sales/Support Staff | Sales/support should no longer own execution |
| Ready-stock pick / pack / ship | Operations Staff | Manager | Operational execution |
| Pre-order waiting arrival | Operations Staff | Manager | Supply/inbound execution |
| Prescription missing | Sales/Support Staff | Operations Staff | Customer follow-up first |
| Prescription review / approval | Operations Staff | Sales/Support Staff | Technical validation |
| Lab / processing | Operations Staff | Manager | Execution and SLA |
| Return / refund request intake | Sales/Support Staff | Manager | Customer-facing case entry |
| Return physical verification | Operations Staff | Sales/Support Staff | Physical goods verification |
| Refund approval above threshold | Manager | Sales/Support Staff | Financial/business control |
| Pricing / discount / policy change | Manager | System Admin | Admin supports platform, not business authority |
| Auth / permission / env issue | System Admin | Manager | System-level ownership |

## 4. Frontend Status Assessment

## 4.1 Executive Summary

Current frontend maturity is best described as:

- `~65%` complete as a business prototype / internal demo.
- `~40-45%` complete as a production-ready operational frontend.

What this means:

- The app already contains substantial role-based structure and many useful business flows.
- Several important screens are connected to live APIs.
- Several operational and management screens are still hybrid or mock-based.
- Role restrictions are not fully enforced yet.
- Deployment/auth configuration is not fully production-ready.

Build status:

- `next build` succeeds locally.

Production blocker currently observed:

- Authentication configuration fails in production unless `AUTH_SECRET` or `NEXTAUTH_SECRET` is set.

## 4.2 Role Coverage Summary

| Role | Current FE Coverage | Maturity | Notes |
| --- | --- | --- | --- |
| Sales/Support Staff | Broad route coverage and usable core workflows | Medium-High | Best-developed business role |
| Operations Staff | Broad route coverage with mixed real and local/mock workflows | Medium | Main execution concepts are present |
| Manager | Good route coverage but mixed real and mock management modules | Medium-Low | Products and users are stronger than pricing/policy/discount/revenue |
| System Admin | No dedicated route/module yet | Very Low | Not started as a real FE domain |

## 4.3 What Is Already Connected to Real APIs

### Authentication

- Credentials-based auth is wired through NextAuth.
- Login uses backend auth.
- Post-login role redirect exists.

Evidence:

- `src/lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/[locale]/auth/post-login/page.tsx`

### Sales/Support Staff Core Flows

- Pending order list reads real orders.
- Order confirmation uses backend status update.
- Order rejection uses backend cancel flow.
- Customer list reads real users.
- Product lookup reads real product data.

Evidence:

- `src/components/pages/OrdersPending.tsx`
- `src/components/pages/Customers.tsx`
- `src/components/pages/Products.tsx`

### Operations Staff Core Flows

- Prescription queue reads real orders.
- Prescription values can be patched to backend items.
- Approved prescription can move order to processing.
- Inventory stock list reads backend inventory.
- Inventory stock update calls backend inventory API.

Evidence:

- `src/components/pages/OrdersPrescription.tsx`
- `src/components/pages/Inventory.tsx`

### Manager Core Flows

- Product management reads, updates status, creates, edits, and deletes through product APIs.
- User management reads, creates, edits, and deletes through user APIs.

Evidence:

- `app/[locale]/manager/products/page.tsx`
- `app/[locale]/manager/products/create/page.tsx`
- `app/[locale]/manager/products/[id]/page.tsx`
- `app/[locale]/manager/users/page.tsx`
- `app/[locale]/manager/users/create/page.tsx`
- `app/[locale]/manager/users/[id]/page.tsx`

## 4.4 What Is Hybrid or Partially Implemented

### Ready Stock Operations

Status:

- Orders are loaded from backend.
- Operational sub-state such as assignee, hold, tracking, and internal status is stored locally in persisted Zustand state.

Impact:

- Good as a workflow prototype.
- Not yet a reliable shared operational system across users/devices.

Evidence:

- `src/components/pages/OrdersReadyStock.tsx`
- `src/stores/readyStockOpsStore.ts`

### Pre-order Operations

Status:

- Base order data is derived from backend orders.
- Many workflow transitions are still local state updates rather than backend workflow actions.

Evidence:

- `src/components/pages/OrdersPreorder.tsx`

### Delayed / Alerts

Status:

- Delay detection derives from backend order data.
- Escalate/contact/resolve actions are not integrated; they only log locally.

Evidence:

- `src/components/pages/OrdersDelayed.tsx`
- `src/lib/orderWorkflow.ts`

## 4.5 What Is Still Mock or Demo-Oriented

### Shipping and Handover

Status:

- Shipment creation, shipment tracking, COD reconciliation, and handover currently rely heavily on mock data and local state.

Evidence:

- `src/components/pages/Ship.tsx`
- `src/components/pages/ShippingTracking.tsx`
- `src/components/pages/ShippingHandover.tsx`
- `src/data/fulfillmentData.ts`
- `src/data/shippingData.ts`
- `src/data/handoverData.ts`

### Returns and Refunds

Status:

- UI exists.
- Business interactions are mock-driven or local-only.

Evidence:

- `src/components/pages/Returns.tsx`
- `src/components/pages/Refunds.tsx`
- `src/data/returnsData.ts`
- `src/data/refundData.ts`

### Pre-order Import

Status:

- Import/batch UI exists.
- Screen is driven by mock batch data and local modal actions.

Evidence:

- `src/components/pages/PreorderImport.tsx`
- `src/data/preorderImportData.ts`

### Manager Discounts and Policies

Status:

- Screen flows and forms exist.
- Listing/detail/create/update/delete are not wired to real APIs.
- Current behavior is based on local data and `console.log`.

Evidence:

- `app/[locale]/manager/discounts/page.tsx`
- `app/[locale]/manager/discounts/[id]/page.tsx`
- `app/[locale]/manager/discounts/create/page.tsx`
- `app/[locale]/manager/policies/page.tsx`
- `app/[locale]/manager/policies/[id]/page.tsx`
- `app/[locale]/manager/policies/create/page.tsx`

### Manager Pricing and Revenue

Status:

- Screens exist mainly as dashboard placeholders.
- No real backend integration is visible yet.

Evidence:

- `app/[locale]/manager/pricing/page.tsx`
- `app/[locale]/manager/revenue/page.tsx`
- `app/[locale]/manager/revenue-new/page.tsx`

### Legacy Multi-role Dashboard

Status:

- A legacy dashboard area still exists.
- Some pages are placeholders and do not represent the current role-based structure.

Evidence:

- `app/[locale]/(dashboard)/layout.tsx`
- `app/[locale]/(dashboard)/dashboard/orders/page.tsx`
- `app/[locale]/(dashboard)/dashboard/orders/[id]/page.tsx`

## 4.6 Security and Role-Gating Gaps

### Route protection is incomplete

Status:

- Middleware protects only a limited set of generic root paths.
- Direct role areas such as `/sale/*`, `/operation/*`, and `/manager/*` are not fully guarded by explicit role-based checks.

Evidence:

- `proxy.ts`

### Frontend access guard is still mocked

Status:

- `CanAccess` is still hardcoded with role `staff`.

Impact:

- UI permission behavior is not trustworthy for real role separation yet.

Evidence:

- `src/components/atoms/CanAccess.tsx`

### System Admin frontend does not exist yet

Status:

- There is no dedicated `/admin` route group.

Impact:

- System admin responsibilities are not yet represented in the frontend.

## 4.7 Current Technical Risks

Main risks:

- Auth production config not complete.
- Role gating not fully enforced.
- Important ops state still local-only.
- High-value business areas are still mock-based.
- Legacy route groups may confuse ownership and routing strategy.

Specific examples:

- Missing production auth secret blocks stable deployment.
- Ready-stock operations are not synchronized through backend workflow state.
- Returns/refunds are not production-grade yet.
- Discounts/policies/revenue are not yet real management tools.

## 5. Suggested Delivery Priorities

Recommended order of work:

### Priority 1: Auth and Role Enforcement

- Fix production auth configuration.
- Replace mocked role checks with session-based role checks.
- Protect `/sale/*`, `/operation/*`, `/manager/*`, and future `/admin/*`.

### Priority 2: Stabilize Core Business Ownership

- Finalize staff intake and follow-up flows.
- Finalize operation workflow ownership and backend status model.
- Define explicit escalation to manager.

### Priority 3: Backendize High-Value Operational Screens

- Ready stock workflow state.
- Shipping creation/tracking/handover.
- Returns and refunds.
- Pre-order import and inbound flow.

### Priority 4: Finish Manager Real Modules

- Discounts CRUD with real API.
- Policies CRUD with real API.
- Pricing control with real API.
- Revenue dashboards with real metrics.

### Priority 5: Build System Admin Domain

- Admin route group.
- Permission matrix UI.
- Audit log viewer.
- Integration and auth/system settings.

## 6. Practical Conclusion

Current frontend is already strong enough to:

- Demonstrate the business role model.
- Validate route and UI structure for staff, operation, and manager.
- Support several real data flows, especially orders, products, users, inventory, and prescription handling.

Current frontend is not yet strong enough to:

- Be considered a fully controlled production business system.
- Guarantee proper role separation.
- Run shared operational state reliably across teams.
- Represent system admin responsibilities.

In short:

- `Sales/Support Staff`: meaningful and usable prototype, with some real backend actions.
- `Operations Staff`: good business modeling, but still partly local/mock.
- `Manager`: partly real, partly placeholder/mock.
- `System Admin`: not yet implemented in FE.
