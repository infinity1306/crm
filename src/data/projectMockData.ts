// Phase 3 — Projects, Tasks, Milestones, Daily Updates & Tickets Mock Data
// STAR CHAIN LABS Internal Delivery Operations

import { 
  Project, 
  Milestone, 
  Task, 
  DailyWorkUpdate, 
  InternalTicket, 
  ProjectFile 
} from '../types/projects';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Omnichannel Supply Chain & Inventory Portal',
    clientId: 'comp-1',
    clientName: 'Aditya Birla Group',
    managerId: 'emp-2',
    managerName: 'Dhruv Patel',
    teamIds: ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
    teamMembers: [
      { id: 'emp-2', name: 'Dhruv Patel', role: 'Project Manager', department: 'Engineering' },
      { id: 'emp-1', name: 'Shivanshu Tiwari', role: 'Lead Architect', department: 'Engineering' },
      { id: 'emp-3', name: 'Priya Sharma', role: 'Product Lead', department: 'Product' },
      { id: 'emp-4', name: 'Siddharth Roy', role: 'Senior Backend Engineer', department: 'Engineering' }
    ],
    description: 'Enterprise inventory distribution portal, real-time SAP ERP telemetry, multi-warehouse dispatching, and automated supplier bill reconciliation.',
    status: 'active',
    health: 'on_track',
    startDate: '2026-08-01',
    deadline: '2026-10-31',
    budget: 4500000, // ₹45.0L
    priority: 'high',
    tags: ['Enterprise', 'Supply Chain', 'SAP ERP', 'High Availability'],
    template: 'Enterprise Web Application',
    progress: 68,
    lastUpdated: '15 mins ago',
    notes: 'Phase 1 & 2 signed off by client CTO. Sprints progressing well. Frontend ERP layout in final QA.',
    dealId: 'deal-1'
  },
  {
    id: 'proj-2',
    name: 'Core Payment Gateway & Webhook Mesh',
    clientId: 'comp-2',
    clientName: 'NextGen Systems Pvt Ltd',
    managerId: 'emp-2',
    managerName: 'Dhruv Patel',
    teamIds: ['emp-2', 'emp-4', 'emp-5'],
    teamMembers: [
      { id: 'emp-2', name: 'Dhruv Patel', role: 'Project Manager', department: 'Engineering' },
      { id: 'emp-4', name: 'Siddharth Roy', role: 'Senior Backend Engineer', department: 'Engineering' },
      { id: 'emp-5', name: 'Rahul Mehta', role: 'DevOps & Security', department: 'Engineering' }
    ],
    description: 'PCI-DSS certified payment routing engine, multi-acquirer failover mesh, and high-concurrency webhook callback ingestion pipeline.',
    status: 'active',
    health: 'at_risk',
    startDate: '2026-08-15',
    deadline: '2026-10-15',
    budget: 2800000, // ₹28.0L
    priority: 'critical',
    tags: ['Fintech', 'Payments', 'PCI-DSS', 'Webhooks'],
    template: 'High-Concurrency API Mesh',
    progress: 42,
    lastUpdated: '2 hours ago',
    notes: 'Blocked on client sandbox webhook authentication credentials. Ticket #204 raised.',
    dealId: 'deal-2'
  },
  {
    id: 'proj-3',
    name: 'Healthcare Telemetry & Compliance Vault',
    clientId: 'comp-3',
    clientName: 'Zenith Labs India',
    managerId: 'emp-3',
    managerName: 'Priya Sharma',
    teamIds: ['emp-3', 'emp-1', 'emp-5'],
    teamMembers: [
      { id: 'emp-3', name: 'Priya Sharma', role: 'Project Manager', department: 'Product' },
      { id: 'emp-1', name: 'Shivanshu Tiwari', role: 'Security Architect', department: 'Engineering' },
      { id: 'emp-5', name: 'Rahul Mehta', role: 'Compliance Engineer', department: 'Operations' }
    ],
    description: 'HIPAA & DISHA compliant clinical diagnostic telemetry, encrypted DICOM medical image storage, and audited patient consent verification.',
    status: 'planning',
    health: 'on_track',
    startDate: '2026-09-10',
    deadline: '2026-12-15',
    budget: 3500000, // ₹35.0L
    priority: 'medium',
    tags: ['Healthcare', 'DISHA', 'HIPAA', 'Encrypted Vault'],
    template: 'Regulated Data Vault',
    progress: 15,
    lastUpdated: 'Yesterday',
    notes: 'Architecture blueprint finalized. Legal NDA and compliance agreements signed.',
    dealId: 'deal-3'
  },
  {
    id: 'proj-4',
    name: 'CloudSync Multi-Tenant Infrastructure',
    clientId: 'comp-4',
    clientName: 'CloudSync Technologies',
    managerId: 'emp-2',
    managerName: 'Dhruv Patel',
    teamIds: ['emp-1', 'emp-2', 'emp-5'],
    teamMembers: [
      { id: 'emp-2', name: 'Dhruv Patel', role: 'Project Manager', department: 'Engineering' },
      { id: 'emp-1', name: 'Shivanshu Tiwari', role: 'Lead Architect', department: 'Engineering' },
      { id: 'emp-5', name: 'Rahul Mehta', role: 'Cloud DevOps', department: 'Engineering' }
    ],
    description: 'Kubernetes multi-tenant cluster provisioning, automated database branch sharding, and edge CDN cache optimization.',
    status: 'completed',
    health: 'on_track',
    startDate: '2026-06-01',
    deadline: '2026-08-30',
    budget: 1850000, // ₹18.5L
    priority: 'medium',
    tags: ['Cloud', 'Kubernetes', 'Multi-Tenant', 'DevOps'],
    template: 'Cloud Platform Architecture',
    progress: 100,
    lastUpdated: '3 weeks ago',
    notes: 'Successfully deployed to production with 99.99% uptime SLA verification.'
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  // Milestones for proj-1 (Aditya Birla Supply Chain)
  {
    id: 'mls-101',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'System Architecture & Data Schema',
    description: 'Entity relationship design, SAP ERP connector specs, and multi-warehouse tenancy model.',
    ownerId: 'emp-1',
    ownerName: 'Shivanshu Tiwari',
    startDate: '2026-08-01',
    deadline: '2026-08-20',
    progress: 100,
    status: 'completed',
    moduleName: 'Architecture',
    order: 1
  },
  {
    id: 'mls-102',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'Authentication & Role-Based Access Control',
    description: 'OAuth2 SSO, SAML federation for enterprise staff, and granular warehouse dispatch permissions.',
    ownerId: 'emp-4',
    ownerName: 'Siddharth Roy',
    startDate: '2026-08-21',
    deadline: '2026-09-05',
    progress: 100,
    status: 'completed',
    moduleName: 'Authentication',
    order: 2
  },
  {
    id: 'mls-103',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'Core Supply Chain & Warehouse APIs',
    description: 'SKU catalog sync, inventory reservation mutex, multi-node stock counts, and dispatch manifest generator.',
    ownerId: 'emp-4',
    ownerName: 'Siddharth Roy',
    startDate: '2026-09-01',
    deadline: '2026-09-25',
    progress: 75,
    status: 'in_progress',
    moduleName: 'Backend',
    order: 3
  },
  {
    id: 'mls-104',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'Frontend Operations & Dispatch Dashboard',
    description: 'High-density warehouse grid, barcode scanner interface, dispatch routing map, and real-time alerts.',
    ownerId: 'emp-1',
    ownerName: 'Shivanshu Tiwari',
    startDate: '2026-09-10',
    deadline: '2026-10-10',
    progress: 60,
    status: 'in_progress',
    moduleName: 'Frontend',
    order: 4
  },
  {
    id: 'mls-105',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'Load Testing & End-to-End Pen Testing',
    description: '10,000 req/sec load stress tests, automated OWASP ASVS security audit, and disaster recovery drill.',
    ownerId: 'emp-2',
    ownerName: 'Dhruv Patel',
    startDate: '2026-10-05',
    deadline: '2026-10-22',
    progress: 20,
    status: 'upcoming',
    moduleName: 'Testing',
    order: 5
  },
  {
    id: 'mls-106',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    name: 'Production Rollout & SAP Cutover',
    description: 'Zero-downtime database cutover, production telemetry verification, and on-site staff training.',
    ownerId: 'emp-2',
    ownerName: 'Dhruv Patel',
    startDate: '2026-10-23',
    deadline: '2026-10-31',
    progress: 0,
    status: 'upcoming',
    moduleName: 'Deployment',
    order: 6
  },

  // Milestones for proj-2 (NextGen Payment Mesh)
  {
    id: 'mls-201',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    name: 'Acquirer Gateway Interfaces & Protocol Adapters',
    description: 'HDFC, Razorpay, and Stripe server-to-server payment adapter layer with automated failover.',
    ownerId: 'emp-4',
    ownerName: 'Siddharth Roy',
    startDate: '2026-08-15',
    deadline: '2026-09-10',
    progress: 100,
    status: 'completed',
    moduleName: 'Backend',
    order: 1
  },
  {
    id: 'mls-202',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    name: 'Webhook Event Mesh & Callback Ingestion',
    description: 'High-throughput Kafka queue, cryptographic HMAC signature verifier, and idempotent transaction processing.',
    ownerId: 'emp-4',
    ownerName: 'Siddharth Roy',
    startDate: '2026-09-01',
    deadline: '2026-09-30',
    progress: 35,
    status: 'delayed',
    moduleName: 'Integration',
    order: 2
  },
  {
    id: 'mls-203',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    name: 'PCI-DSS Vault Audit & Security Attestation',
    description: 'Tokenization vault isolation, key rotation ceremony, and external QSA penetration sign-off.',
    ownerId: 'emp-5',
    ownerName: 'Rahul Mehta',
    startDate: '2026-09-20',
    deadline: '2026-10-15',
    progress: 10,
    status: 'upcoming',
    moduleName: 'Security',
    order: 3
  }
];

export const INITIAL_TASKS: Task[] = [
  // Tasks for proj-1 (Aditya Birla Group)
  {
    id: 'task-101',
    title: 'Design PostgreSQL Schema & Distributed Tenancy Model',
    description: 'Create normalized relational schema for multi-warehouse SKU inventories, audit trails, and SAP mapping tables.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-101',
    milestoneName: 'System Architecture & Data Schema',
    assigneeId: 'emp-1',
    assigneeName: 'Shivanshu Tiwari',
    priority: 'high',
    status: 'done',
    deadline: '2026-08-15',
    estimatedHours: 32,
    actualHours: 30,
    progress: 100,
    dependencies: [],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-08-01',
    lastUpdated: '2026-08-15',
    commentsCount: 3,
    attachmentsCount: 2
  },
  {
    id: 'task-102',
    title: 'Implement OAuth2 & Enterprise SAML SSO Authentication',
    description: 'Configure Okta / Azure AD SAML 2.0 integration with automatic department role provisioning.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-102',
    milestoneName: 'Authentication & Role-Based Access Control',
    assigneeId: 'emp-4',
    assigneeName: 'Siddharth Roy',
    priority: 'critical',
    status: 'done',
    deadline: '2026-09-02',
    estimatedHours: 24,
    actualHours: 26,
    progress: 100,
    dependencies: ['task-101'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-08-20',
    lastUpdated: '2026-09-02',
    commentsCount: 4,
    attachmentsCount: 1
  },
  {
    id: 'task-103',
    title: 'Build Real-Time Warehouse Inventory Mutex API',
    description: 'Redis distributed locking mechanism to prevent double-allocation of high-velocity SKUs across concurrent orders.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-103',
    milestoneName: 'Core Supply Chain & Warehouse APIs',
    assigneeId: 'emp-4',
    assigneeName: 'Siddharth Roy',
    priority: 'critical',
    status: 'in_progress',
    deadline: '2026-09-24',
    estimatedHours: 40,
    actualHours: 28,
    progress: 75,
    dependencies: ['task-102'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-02',
    lastUpdated: '2 hours ago',
    commentsCount: 6,
    attachmentsCount: 1
  },
  {
    id: 'task-104',
    title: 'Implement Warehouse Manifest & Barcode Scanner UI',
    description: 'Mobile-responsive camera barcode scanner module for dock workers with instantaneous audio confirmation feedback.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-104',
    milestoneName: 'Frontend Operations & Dispatch Dashboard',
    assigneeId: 'emp-1',
    assigneeName: 'Shivanshu Tiwari',
    priority: 'high',
    status: 'in_review',
    deadline: '2026-09-23',
    estimatedHours: 35,
    actualHours: 32,
    progress: 90,
    dependencies: ['task-103'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-10',
    lastUpdated: '3 hours ago',
    commentsCount: 2,
    attachmentsCount: 3
  },
  {
    id: 'task-105',
    title: 'Automate SAP ERP Daily Stock Delta Sync Worker',
    description: 'Batch daemon fetching incremental ERP changes at midnight and reconciling physical warehouse tallies.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-103',
    milestoneName: 'Core Supply Chain & Warehouse APIs',
    assigneeId: 'emp-4',
    assigneeName: 'Siddharth Roy',
    priority: 'medium',
    status: 'todo',
    deadline: '2026-09-28',
    estimatedHours: 28,
    actualHours: 0,
    progress: 0,
    dependencies: ['task-103'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-12',
    lastUpdated: '2026-09-12',
    commentsCount: 1,
    attachmentsCount: 0
  },
  {
    id: 'task-106',
    title: 'Dispatch Routing Matrix & Truck Fleet Allocation Engine',
    description: 'Geospatial algorithm calculating optimal truck dispatches based on crate volume and delivery zones.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-104',
    milestoneName: 'Frontend Operations & Dispatch Dashboard',
    assigneeId: 'emp-1',
    assigneeName: 'Shivanshu Tiwari',
    priority: 'medium',
    status: 'backlog',
    deadline: '2026-10-08',
    estimatedHours: 45,
    actualHours: 0,
    progress: 0,
    dependencies: ['task-104'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-15',
    lastUpdated: '2026-09-15',
    commentsCount: 0,
    attachmentsCount: 0
  },

  // Tasks for proj-2 (NextGen Payment Mesh - includes BLOCKED task with dependency)
  {
    id: 'task-201',
    title: 'Build HMAC-SHA256 Request Signing & Acquirer Adapters',
    description: 'Cryptographic payload signing and header verification across Razorpay, HDFC PG, and Stripe.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-201',
    milestoneName: 'Acquirer Gateway Interfaces & Protocol Adapters',
    assigneeId: 'emp-4',
    assigneeName: 'Siddharth Roy',
    priority: 'critical',
    status: 'done',
    deadline: '2026-09-08',
    estimatedHours: 30,
    actualHours: 32,
    progress: 100,
    dependencies: [],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-08-16',
    lastUpdated: '2026-09-08',
    commentsCount: 5,
    attachmentsCount: 2
  },
  {
    id: 'task-202',
    title: 'Payment Callback Handler & Webhook Ingestion Engine',
    description: 'Handle async callbacks from bank networks, reconcile ledger idempotency, and broadcast downstream events.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-202',
    milestoneName: 'Webhook Event Mesh & Callback Ingestion',
    assigneeId: 'emp-4',
    assigneeName: 'Siddharth Roy',
    priority: 'critical',
    status: 'blocked',
    deadline: '2026-09-22',
    estimatedHours: 36,
    actualHours: 18,
    progress: 45,
    blockedReason: 'Waiting for client sandbox webhook API keys & staging bank certificate from NextGen IT security team.',
    blockedAt: '2026-09-19',
    dependencies: ['task-201'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-05',
    lastUpdated: '1 hour ago',
    commentsCount: 8,
    attachmentsCount: 1
  },
  {
    id: 'task-203',
    title: 'Kafka Consumer Dead Letter Queue & Retry Backoff Mesh',
    description: 'Configurable exponential retry policy with DLQ alerting into Slack/PagerDuty on repeated callback failures.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-202',
    milestoneName: 'Webhook Event Mesh & Callback Ingestion',
    assigneeId: 'emp-5',
    assigneeName: 'Rahul Mehta',
    priority: 'high',
    status: 'in_progress',
    deadline: '2026-09-26',
    estimatedHours: 24,
    actualHours: 14,
    progress: 55,
    dependencies: ['task-201'],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-10',
    lastUpdated: 'Yesterday',
    commentsCount: 2,
    attachmentsCount: 0
  },
  {
    id: 'task-204',
    title: 'Tokenization Vault HSM Key Rotation Drill',
    description: 'Automated quarterly envelope encryption key rotation protocol conforming with PCI-DSS 4.0 Requirement 3.6.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-203',
    milestoneName: 'PCI-DSS Vault Audit & Security Attestation',
    assigneeId: 'emp-5',
    assigneeName: 'Rahul Mehta',
    priority: 'high',
    status: 'todo',
    deadline: '2026-10-05',
    estimatedHours: 20,
    actualHours: 0,
    progress: 0,
    dependencies: [],
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    createdAt: '2026-09-18',
    lastUpdated: '2026-09-18',
    commentsCount: 1,
    attachmentsCount: 1
  }
];

export const INITIAL_DAILY_UPDATES: DailyWorkUpdate[] = [
  {
    id: 'upd-101',
    date: '2026-09-21',
    employeeId: 'emp-4',
    employeeName: 'Siddharth Roy',
    employeeDesignation: 'Senior Backend Engineer',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    taskId: 'task-202',
    taskTitle: 'Payment Callback Handler & Webhook Ingestion Engine',
    completedItems: [
      'Implemented AES-256 GCM token payload decryptor for incoming bank webhooks',
      'Configured Redis lock for idempotency checking during callback bursts'
    ],
    inProgressItems: [
      'Writing automated unit tests for signature mismatches and replay attacks'
    ],
    blockedItems: [
      'Client sandbox webhook keys not provided yet by NextGen team (Ticket #204)'
    ],
    blockedReason: 'Stuck on bank simulator testing until client team generates sandbox secret certificate.',
    nextActionItems: [
      'Follow up on Ticket #204 with NextGen security lead',
      'Finalize DLQ consumer failover specs with Rahul'
    ],
    hoursSpent: 7.5,
    createdAt: 'Today, 17:15'
  },
  {
    id: 'upd-102',
    date: '2026-09-21',
    employeeId: 'emp-1',
    employeeName: 'Shivanshu Tiwari',
    employeeDesignation: 'Lead Architect & Engineer',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    taskId: 'task-104',
    taskTitle: 'Implement Warehouse Manifest & Barcode Scanner UI',
    completedItems: [
      'Integrated HTML5 WebRTC barcode camera scanner with zero lag',
      'Added vibration and audio feedback for successful SKU pallet scan'
    ],
    inProgressItems: [
      'Benchmarking scanner latency across slow 4G Android terminal devices in warehouse'
    ],
    blockedItems: [],
    nextActionItems: [
      'Push branch to staging for warehouse supervisor review tomorrow morning'
    ],
    hoursSpent: 8.0,
    createdAt: 'Today, 16:45'
  },
  {
    id: 'upd-103',
    date: '2026-09-20',
    employeeId: 'emp-4',
    employeeName: 'Siddharth Roy',
    employeeDesignation: 'Senior Backend Engineer',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    taskId: 'task-103',
    taskTitle: 'Build Real-Time Warehouse Inventory Mutex API',
    completedItems: [
      'Merged Redis Redlock cluster mutex logic with 150ms lease expiration',
      'Ran stress test simulating 2,000 parallel stock reservations with zero negative inventory drift'
    ],
    inProgressItems: [
      'Documenting REST API contracts in Swagger / OpenAPI for frontend team'
    ],
    blockedItems: [],
    nextActionItems: [
      'Sync with Shivanshu on manifest generation hooks'
    ],
    hoursSpent: 7.0,
    createdAt: 'Yesterday, 18:00'
  },
  {
    id: 'upd-104',
    date: '2026-09-20',
    employeeId: 'emp-5',
    employeeName: 'Rahul Mehta',
    employeeDesignation: 'DevOps & Security',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    taskId: 'task-203',
    taskTitle: 'Kafka Consumer Dead Letter Queue & Retry Backoff Mesh',
    completedItems: [
      'Configured Strimzi Kafka operator in staging EKS cluster',
      'Defined exponential backoff strategy: 5s, 30s, 5m, 1h'
    ],
    inProgressItems: [
      'Connecting webhook dead letter alerts to Star Chain Slack #eng-alerts channel'
    ],
    blockedItems: [],
    nextActionItems: [
      'Simulate poison pill message ingestion test'
    ],
    hoursSpent: 6.5,
    createdAt: 'Yesterday, 17:30'
  }
];

export const INITIAL_INTERNAL_TICKETS: InternalTicket[] = [
  {
    id: 'TICK-204',
    title: 'Payment callback failing during testing — Client sandbox credential mismatch',
    description: 'Payment callback tests against NextGen staging environment are rejecting HMAC headers with 401 Unauthorized. We need the updated client webhook signing secret and mutual TLS certificate.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-202',
    milestoneName: 'Webhook Event Mesh & Callback Ingestion',
    taskId: 'task-202',
    taskTitle: 'Payment Callback Handler & Webhook Ingestion Engine',
    createdBy: 'emp-4',
    createdByName: 'Siddharth Roy',
    assignedToId: 'emp-2',
    assignedToName: 'Dhruv Patel',
    priority: 'critical',
    status: 'in_progress',
    type: 'technical',
    createdAt: '2026-09-19 15:10',
    updatedAt: '2026-09-21 14:20',
    messages: [
      {
        id: 'msg-t-1',
        authorId: 'emp-4',
        authorName: 'Siddharth Roy',
        authorRole: 'Senior Backend Engineer',
        content: 'Callback signature verification is failing against NextGen sandbox. It seems they rotated keys on their end without sending the updated public certificate.',
        createdAt: '19 Sep, 15:10'
      },
      {
        id: 'msg-t-2',
        authorId: 'emp-2',
        authorName: 'Dhruv Patel',
        authorRole: 'Project Manager',
        content: 'Spoke with Vikram from NextGen. They confirmed a staging security patch rotated the HMAC seed. He promised to send the revised .pem bundle by 18:00 today.',
        createdAt: '20 Sep, 11:30'
      }
    ],
    attachments: [
      {
        id: 'att-t-1',
        name: 'hmac_verification_error_dump.log',
        size: '14.2 KB',
        type: 'log',
        uploadedAt: '19 Sep, 15:12',
        uploadedBy: 'Siddharth Roy'
      }
    ]
  },
  {
    id: 'TICK-205',
    title: 'Payment API ka current status kya hai?',
    description: 'Admin operational request from management to obtain structured status, deliverables, and production readiness timeline for the Payment API.',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    milestoneId: 'mls-201',
    milestoneName: 'Acquirer Gateway Interfaces & Protocol Adapters',
    taskId: 'task-201',
    taskTitle: 'Build HMAC-SHA256 Request Signing & Acquirer Adapters',
    createdBy: 'emp-2',
    createdByName: 'Dhruv Patel',
    assignedToId: 'emp-4',
    assignedToName: 'Siddharth Roy',
    priority: 'high',
    status: 'resolved',
    type: 'operational_query',
    createdAt: '2026-09-20 09:30',
    updatedAt: '2026-09-20 16:45',
    resolvedAt: '2026-09-20 16:45',
    messages: [
      {
        id: 'msg-t-3',
        authorId: 'emp-2',
        authorName: 'Dhruv Patel',
        authorRole: 'Engineering Director',
        content: 'Payment API ka current status kya hai? Client CTO is asking for an executive briefing before our sprint demo.',
        createdAt: '20 Sep, 09:30',
        isAdminQuery: true
      },
      {
        id: 'msg-t-4',
        authorId: 'emp-4',
        authorName: 'Siddharth Roy',
        authorRole: 'Senior Backend Engineer',
        content: 'Current Status: 85% completed. Webhook integration and HMAC verification logic are done. Only production staging sandbox testing remains pending credentials. ETA is 22 Sep.',
        createdAt: '20 Sep, 16:45',
        queryResponseData: {
          currentProgressPercent: 85,
          completedSummary: 'Webhook integration, multi-acquirer adapter router, and HMAC-SHA256 signature verification pipeline.',
          remainingSummary: 'Final integration staging tests once client sandbox certificate is installed.',
          eta: '22 Sep 2026',
          additionalNotes: 'Ready for client staging demo immediately upon credential provision.'
        }
      }
    ],
    attachments: []
  },
  {
    id: 'TICK-206',
    title: 'Client requested revision on dispatch manifest print format',
    description: 'Aditya Birla warehouse supervisor requested adding QR code pallet IDs and driver license verification field on the physical dispatch receipt.',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    milestoneId: 'mls-104',
    milestoneName: 'Frontend Operations & Dispatch Dashboard',
    taskId: 'task-104',
    taskTitle: 'Implement Warehouse Manifest & Barcode Scanner UI',
    createdBy: 'emp-3',
    createdByName: 'Priya Sharma',
    assignedToId: 'emp-1',
    assignedToName: 'Shivanshu Tiwari',
    priority: 'medium',
    status: 'assigned',
    type: 'client_issue',
    createdAt: '2026-09-21 11:15',
    updatedAt: '2026-09-21 11:15',
    messages: [
      {
        id: 'msg-t-5',
        authorId: 'emp-3',
        authorName: 'Priya Sharma',
        authorRole: 'Product Lead',
        content: 'Aditya Birla team wants 2 additional fields on the printed thermal PDF manifest: QR code pallet reference and driver Aadhaar / License verification.',
        createdAt: 'Today, 11:15'
      }
    ],
    attachments: []
  }
];

export const INITIAL_PROJECT_FILES: ProjectFile[] = [
  {
    id: 'file-101',
    name: 'Aditya_Birla_Omnichannel_Architecture_v2.4.pdf',
    category: 'designs',
    size: '4.8 MB',
    uploadedBy: 'emp-1',
    uploadedByName: 'Shivanshu Tiwari',
    uploadedAt: '2026-08-04',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    downloadUrl: '#'
  },
  {
    id: 'file-102',
    name: 'SAP_ERP_Connector_Field_Mapping_Spec.xlsx',
    category: 'documents',
    size: '1.2 MB',
    uploadedBy: 'emp-2',
    uploadedByName: 'Dhruv Patel',
    uploadedAt: '2026-08-12',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    downloadUrl: '#'
  },
  {
    id: 'file-103',
    name: 'Warehouse_Scanner_UI_Figma_Handoff.zip',
    category: 'assets',
    size: '18.4 MB',
    uploadedBy: 'emp-3',
    uploadedByName: 'Priya Sharma',
    uploadedAt: '2026-09-11',
    projectId: 'proj-1',
    projectName: 'Omnichannel Supply Chain & Inventory Portal',
    taskId: 'task-104',
    taskTitle: 'Implement Warehouse Manifest & Barcode Scanner UI',
    downloadUrl: '#'
  },
  {
    id: 'file-201',
    name: 'NextGen_Payment_Mesh_Threat_Model_PCI.pdf',
    category: 'documents',
    size: '3.1 MB',
    uploadedBy: 'emp-5',
    uploadedByName: 'Rahul Mehta',
    uploadedAt: '2026-08-19',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    downloadUrl: '#'
  },
  {
    id: 'file-202',
    name: 'Acquirer_Gateway_Benchmark_Load_Report.pdf',
    category: 'reports',
    size: '2.3 MB',
    uploadedBy: 'emp-4',
    uploadedByName: 'Siddharth Roy',
    uploadedAt: '2026-09-09',
    projectId: 'proj-2',
    projectName: 'Core Payment Gateway & Webhook Mesh',
    taskId: 'task-201',
    taskTitle: 'Build HMAC-SHA256 Request Signing & Acquirer Adapters',
    downloadUrl: '#'
  }
];
