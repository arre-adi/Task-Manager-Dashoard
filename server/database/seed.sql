TRUNCATE TABLE tasks, project_members, projects, users RESTART IDENTITY CASCADE;

-- Standard password hash for 'password123'
-- $2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6

INSERT INTO users (name, email, password_hash, created_at, avatar_url)
VALUES
  ('Priya Nair', 'priya@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '30 days', '/avatars/Afterclap-1.png'),
  ('Arjun Mehta', 'arjun@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '28 days', '/avatars/Afterclap-5.png'),
  ('Sneha Iyer', 'sneha@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '26 days', '/avatars/Afterclap-3.png'),
  ('Rahul Verma', 'rahul@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '24 days', '/avatars/Afterclap-9.png'),
  ('Kavya Reddy', 'kavya@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '22 days', '/avatars/Afterclap-2.png'),
  ('Amit Sharma', 'amit@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '20 days', '/avatars/Afterclap-8.png'),
  ('Anjali Gupta', 'anjali@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '18 days', '/avatars/Afterclap-4.png'),
  ('Vikram Singh', 'vikram@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '16 days', '/avatars/Afterclap-7.png'),
  ('Ava Admin', 'admin@taskorbit.dev', '$2a$10$fYnviXBefpJE.44LAkKnu.3G93CnIa.XXiQ92HV445xQ.rEcTZwL6', NOW() - INTERVAL '15 days', '/avatars/Afterclap-6.png');

INSERT INTO projects (name, description, created_by, created_at)
VALUES
  ('BharatPay Merchant App', 'UPI onboarding, settlements, and merchant issue tracking for small businesses across India.', 1, NOW() - INTERVAL '25 days'),
  ('GST Insights Portal', 'Analytics dashboard for finance teams tracking invoices, filings, and compliance alerts.', 1, NOW() - INTERVAL '22 days'),
  ('Bengaluru Platform Revamp', 'Core platform performance, API cleanup, and observability improvements for the next quarter.', 2, NOW() - INTERVAL '20 days'),
  ('Diwali Growth Release', 'Festive campaign landing pages, referral flows, and release coordination before Diwali.', 3, NOW() - INTERVAL '18 days'),
  ('Zomato Integration Module', 'Webhooks and API bridges for real-time order syncing and inventory management.', 6, NOW() - INTERVAL '15 days'),
  ('Swiggy Logistics Engine', 'Hyperlocal delivery routing optimizations and rider assignment algorithms.', 6, NOW() - INTERVAL '12 days');

INSERT INTO project_members (user_id, project_id, role)
VALUES
  (1, 1, 'ADMIN'), (2, 1, 'MEMBER'), (3, 1, 'MEMBER'), (4, 1, 'MEMBER'), (7, 1, 'MEMBER'),
  (1, 2, 'ADMIN'), (3, 2, 'MEMBER'), (4, 2, 'MEMBER'), (5, 2, 'MEMBER'), (8, 2, 'MEMBER'),
  (2, 3, 'ADMIN'), (1, 3, 'MEMBER'), (4, 3, 'MEMBER'), (5, 3, 'MEMBER'), (6, 3, 'MEMBER'),
  (3, 4, 'ADMIN'), (1, 4, 'MEMBER'), (2, 4, 'MEMBER'), (5, 4, 'MEMBER'), (7, 4, 'MEMBER'),
  (6, 5, 'ADMIN'), (1, 5, 'MEMBER'), (2, 5, 'MEMBER'), (8, 5, 'MEMBER'),
  (6, 6, 'ADMIN'), (4, 6, 'MEMBER'), (7, 6, 'MEMBER'), (8, 6, 'MEMBER');

INSERT INTO tasks (title, description, status, priority, due_date, created_by, assigned_to, project_id, created_at, updated_at)
VALUES
  -- BharatPay Merchant App
  ('Fix UPI refund queue retry bug', 'Investigate duplicate retries in the payout worker and patch the settlement callback logic.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '5 days', 1, 2, 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 hours'),
  ('Review merchant onboarding Hindi flow', 'Validate translations and field hints for the KYC journey in tier-2 cities.', 'IN_PROGRESS', 'MEDIUM', CURRENT_DATE + INTERVAL '8 days', 1, 3, 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 hours'),
  ('Add Razorpay webhook signature logs', 'Improve observability around failed webhook validation for merchant payment events.', 'DONE', 'LOW', CURRENT_DATE + INTERVAL '2 days', 2, 4, 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '1 hour'),
  ('Draft Mumbai merchant rollout plan', 'Coordinate with the field team for the QR code deployment in Dadar and Lower Parel.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '12 days', 1, 7, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
  ('Optimize Aadhaar OCR latency', 'Reduce the processing time for Aadhaar card uploads during the KYC step.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '3 days', 3, 4, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 hours'),
  ('Integration with ICICI Payout API', 'Map the new payout status codes and handle edge cases for pending settlements.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '10 days', 1, 2, 1, NOW() - INTERVAL '2 days', NOW()),

  -- GST Insights Portal
  ('Design GST filing summary cards', 'Create clearer summary blocks for monthly filing health and pending invoices.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '6 days', 1, 5, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 hours'),
  ('Backfill invoice sync failures', 'Run a repair job for invoice records that missed the nightly sync window in March.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '3 days', 4, 1, 2, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 hours'),
  ('Verify Maharashtra state tax filters', 'Check state-specific reports and edge cases for GST breakdown widgets.', 'DONE', 'MEDIUM', CURRENT_DATE + INTERVAL '1 day', 5, 3, 2, NOW() - INTERVAL '11 days', NOW() - INTERVAL '30 minutes'),
  ('Add finance demo dataset for CA firms', 'Seed realistic chart data for Chartered Accountant portal demonstrations.', 'TODO', 'LOW', CURRENT_DATE + INTERVAL '9 days', 1, 8, 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '8 hours'),
  ('Implement E-Way Bill export', 'Allow users to export bulk E-Way bill data in JSON format for the government portal.', 'IN_PROGRESS', 'MEDIUM', CURRENT_DATE + INTERVAL '7 days', 8, 4, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'),
  ('Fix rounded-off error in SGST calculation', 'Adjust the decimal precision to match the 18% GST slab requirements.', 'DONE', 'HIGH', CURRENT_DATE - INTERVAL '1 day', 3, 5, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'),

  -- Bengaluru Platform Revamp
  ('Reduce API latency on order service', 'Profile the summary endpoint and remove the slow N+1 query in the platform layer.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '4 days', 2, 4, 3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '45 minutes'),
  ('Clean up deprecated feature flags', 'Remove stale launch flags and document rollback safety for the core platform.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '12 days', 2, 1, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 hours'),
  ('Set up Grafana alert for Redis', 'Track memory pressure before the weekend campaign traffic starts climbing.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '2 days', 4, 5, 3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '75 minutes'),
  ('Plan blue-green deployment for auth', 'Coordinate deployment slots and fallback checks for the next auth API cutover.', 'DONE', 'MEDIUM', CURRENT_DATE + INTERVAL '7 days', 5, 2, 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
  ('Migrate legacy logs to ELK stack', 'Move logs from flat files to Elasticsearch for better query performance.', 'TODO', 'LOW', CURRENT_DATE + INTERVAL '15 days', 2, 6, 3, NOW() - INTERVAL '2 days', NOW()),
  ('Update Node.js to v20 LTS', 'Update all microservices to use the latest LTS version for security and performance.', 'DONE', 'HIGH', CURRENT_DATE - INTERVAL '2 days', 1, 2, 3, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),

  -- Diwali Growth Release
  ('Build Diwali referral landing page', 'Ship the festive referral hero, coupon handling, and campaign tracking hooks.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '10 days', 3, 1, 4, NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 hours'),
  ('QA coupon edge cases on mobile web', 'Test stacked offers, expired codes, and low bandwidth behavior on Android.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '6 days', 3, 2, 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '7 hours'),
  ('Fix coupon redemption audit log', 'Patch missing audit entries for redemptions on the festive microsite.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '1 day', 2, 5, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '15 minutes'),
  ('Design "Shubh Aarambh" banner', 'Create the primary hero asset for the Diwali sale kickoff on the mobile app.', 'DONE', 'MEDIUM', CURRENT_DATE + INTERVAL '4 days', 7, 3, 4, NOW() - INTERVAL '9 days', NOW() - INTERVAL '3 days'),
  ('Load test referral API with 10k CCU', 'Ensure the referral engine doesn''t crash when the push notification is sent out.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '2 days', 3, 5, 4, NOW() - INTERVAL '1 day', NOW()),

  -- Zomato Integration Module
  ('Handle restaurant-side cancellation', 'Map Zomato''s cancellation reason codes to our internal order management state.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '4 days', 6, 1, 5, NOW() - INTERVAL '3 days', NOW()),
  ('Sync inventory for Pune outlets', 'Automate the item availability updates for the new kitchen outlets in Baner and Wakad.', 'IN_PROGRESS', 'MEDIUM', CURRENT_DATE + INTERVAL '5 days', 6, 2, 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 hours'),
  ('Fix webhook timeout on order confirmation', 'Increase the timeout and implement a retry queue for slow response from the Zomato bridge.', 'DONE', 'HIGH', CURRENT_DATE + INTERVAL '2 days', 8, 6, 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour'),
  ('Add support for item customization (Add-ons)', 'Update the payload schema to include extra cheese, spice levels, and other variations.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '8 days', 6, 8, 5, NOW() - INTERVAL '1 day', NOW()),

  -- Swiggy Logistics Engine
  ('Optimize Indiranagar delivery routes', 'Tweak the routing algorithm to avoid known construction blocks in 100ft road.', 'IN_PROGRESS', 'HIGH', CURRENT_DATE + INTERVAL '3 days', 6, 4, 6, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 hours'),
  ('Rider batching for lunch rush', 'Implement logic to assign multiple orders from the same mall to a single rider.', 'TODO', 'HIGH', CURRENT_DATE + INTERVAL '5 days', 6, 7, 6, NOW() - INTERVAL '3 days', NOW()),
  ('Implement rider fuel incentive tracker', 'Calculate bonus payouts based on distance covered during peak hours.', 'DONE', 'LOW', CURRENT_DATE + INTERVAL '10 days', 7, 8, 6, NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
  ('Update Koramangala geo-fence', 'Expand the active zone to include newly opened commercial hubs near Silk Board.', 'TODO', 'MEDIUM', CURRENT_DATE + INTERVAL '7 days', 6, 4, 6, NOW() - INTERVAL '2 days', NOW());
