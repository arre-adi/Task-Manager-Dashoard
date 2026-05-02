TRUNCATE TABLE tasks, project_members, projects, users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash, created_at)
VALUES
  ('Priya Nair', 'priya@taskorbit.dev', '$2a$10$k3qVpZ5kHncXC4SXGXgha.FDrPhJRF/6Vln892U4YrW/J1jmUFWuq', NOW() - INTERVAL '28 days'),
  ('Arjun Mehta', 'arjun@taskorbit.dev', '$2a$10$k3qVpZ5kHncXC4SXGXgha.FDrPhJRF/6Vln892U4YrW/J1jmUFWuq', NOW() - INTERVAL '26 days'),
  ('Sneha Iyer', 'sneha@taskorbit.dev', '$2a$10$k3qVpZ5kHncXC4SXGXgha.FDrPhJRF/6Vln892U4YrW/J1jmUFWuq', NOW() - INTERVAL '24 days'),
  ('Rahul Verma', 'rahul@taskorbit.dev', '$2a$10$k3qVpZ5kHncXC4SXGXgha.FDrPhJRF/6Vln892U4YrW/J1jmUFWuq', NOW() - INTERVAL '22 days'),
  ('Kavya Reddy', 'kavya@taskorbit.dev', '$2a$10$k3qVpZ5kHncXC4SXGXgha.FDrPhJRF/6Vln892U4YrW/J1jmUFWuq', NOW() - INTERVAL '20 days');

INSERT INTO projects (name, description, created_by, created_at)
VALUES
  ('BharatPay Merchant App', 'UPI onboarding, settlements, and merchant issue tracking for small businesses across India.', 1, NOW() - INTERVAL '18 days'),
  ('GST Insights Portal', 'Analytics dashboard for finance teams tracking invoices, filings, and compliance alerts.', 1, NOW() - INTERVAL '16 days'),
  ('Bengaluru Platform Revamp', 'Core platform performance, API cleanup, and observability improvements for the next quarter.', 2, NOW() - INTERVAL '14 days'),
  ('Diwali Growth Release', 'Festive campaign landing pages, referral flows, and release coordination before Diwali.', 3, NOW() - INTERVAL '12 days');

INSERT INTO project_members (user_id, project_id, role)
VALUES
  (1, 1, 'ADMIN'),
  (2, 1, 'MEMBER'),
  (3, 1, 'MEMBER'),
  (4, 1, 'MEMBER'),
  (1, 2, 'ADMIN'),
  (3, 2, 'MEMBER'),
  (4, 2, 'MEMBER'),
  (5, 2, 'MEMBER'),
  (2, 3, 'ADMIN'),
  (1, 3, 'MEMBER'),
  (4, 3, 'MEMBER'),
  (5, 3, 'MEMBER'),
  (3, 4, 'ADMIN'),
  (1, 4, 'MEMBER'),
  (2, 4, 'MEMBER'),
  (5, 4, 'MEMBER');

INSERT INTO tasks (
  title,
  description,
  status,
  priority,
  due_date,
  created_by,
  assigned_to,
  project_id,
  created_at,
  updated_at
)
VALUES
  ('Fix UPI refund queue retry bug', 'Investigate duplicate retries in the payout worker and patch the settlement callback logic.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '5 days', 1, 2, 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 hours'),
  ('Review merchant onboarding copy for Hindi flow', 'Validate translations and field hints for the KYC onboarding journey used in tier-2 cities.', 'IN_PROGRESS', 'MEDIUM', CURRENT_DATE + INTERVAL '8 days', 1, 3, 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 hours'),
  ('Add Razorpay webhook signature logs', 'Improve observability around failed webhook validation for merchant payment events.', 'DONE', 'LOW', CURRENT_DATE + INTERVAL '2 days', 2, 4, 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '1 hour'),
  ('Prepare merchant dashboard release notes', 'Write a concise note for support teams covering settlement history and payout status changes.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '11 days', 3, 1, 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days'),
  ('Design GST filing summary cards', 'Create clearer summary blocks for monthly filing health, pending invoices, and compliance alerts.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '6 days', 1, 5, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 hours'),
  ('Backfill invoice sync failures from March', 'Run a one-time repair job for invoice records that missed the nightly sync window.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '3 days', 4, 1, 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 hours'),
  ('Verify Maharashtra state tax filters', 'Check state-specific reports and edge cases for GST breakdown widgets.', 'DONE', 'MEDIUM', CURRENT_DATE + INTERVAL '1 day', 5, 3, 2, NOW() - INTERVAL '11 days', NOW() - INTERVAL '30 minutes'),
  ('Add finance demo dataset for CA firms', 'Seed realistic chart data so the portal demo looks credible for chartered accountant partners.', 'TODO', 'LOW', CURRENT_DATE + INTERVAL '9 days', 1, 4, 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '8 hours'),
  ('Reduce API latency on order summary service', 'Profile the summary endpoint and remove the slow N+1 query in the platform layer.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '4 days', 2, 4, 3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '45 minutes'),
  ('Clean up deprecated Bengaluru feature flags', 'Remove stale launch flags and document what is still needed for rollback safety.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '12 days', 2, 1, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 hours'),
  ('Set up Grafana alert for Redis saturation', 'Track memory pressure before the weekend campaign traffic starts climbing.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '2 days', 4, 5, 3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '75 minutes'),
  ('Plan blue-green deployment for auth service', 'Coordinate deployment slots and fallback checks for the next auth API cutover.', 'DONE', 'MEDIUM', CURRENT_DATE + INTERVAL '7 days', 5, 2, 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
  ('Build Diwali referral landing page', 'Ship the festive referral hero, coupon state handling, and campaign tracking hooks.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '10 days', 3, 1, 4, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 hours'),
  ('QA coupon edge cases on mobile web', 'Test stacked offers, expired codes, and low bandwidth behaviour on Android devices.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '6 days', 3, 2, 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 hours'),
  ('Draft Mumbai influencer rollout checklist', 'List assets, legal approvals, and UTM naming rules for the launch plan.', 'TODO', 'LOW', CURRENT_DATE + INTERVAL '14 days', 1, 5, 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '9 hours'),
  ('Fix production issue in coupon redemption audit log', 'Patch missing audit entries for redemptions happening through the festive microsite.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '1 day', 2, 3, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '15 minutes');
