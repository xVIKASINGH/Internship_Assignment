Website Analytics Backend Service
A high-performance backend service for capturing and analyzing website analytics events, built with Node.js, TypeScript, BullMQ, Redis, and MongoDB.
🏗️ Architecture Overview
The system consists of three independent services that work together:
┌──────────────┐      ┌─────────────┐      ┌────────────────┐      ┌──────────────┐
│   Client     │─────▶│  Ingestion  │─────▶│  Redis Queue   │─────▶│  Processor   │
│              │      │   Service   │      │    (BullMQ)    │      │   Worker     │
└──────────────┘      └─────────────┘      └────────────────┘      └──────┬───────┘
                            │                                              │
                            │                                              │
                            ▼                                              ▼
                      ┌─────────────┐                              ┌──────────────┐
                      │  Reporting  │◀─────────────────────────────│   MongoDB    │
                      │   Service   │                              │   Database   │
                      └─────────────┘                              └──────────────┘
Service 1: Ingestion API (Port 3000)

Purpose: Accept analytics events as quickly as possible
Key Feature: Non-blocking - immediately returns success after queuing
Technology: Express.js with BullMQ for job queuing

Service 2: Processor Worker (Background)

Purpose: Process events from the queue and store them in the database
Key Feature: Runs asynchronously, doesn't slow down the ingestion API
Technology: BullMQ worker with MongoDB integration

Service 3: Reporting API (Port 3001)

Purpose: Provide aggregated analytics data
Key Feature: Efficient database queries with aggregation pipelines
Technology: Express.js with MongoDB aggregation

🎯 Architecture Decisions
Why BullMQ + Redis?

Speed: Redis is an in-memory data store, providing sub-millisecond response times
Reliability: BullMQ offers job persistence, retry mechanisms, and failure handling
Scalability: Multiple processor workers can be added to handle increased load
Decoupling: The ingestion API doesn't wait for database writes, eliminating bottlenecks

Why MongoDB?

Flexible Schema: Easy to adapt to changing event structures
Aggregation Framework: Powerful built-in tools for generating analytics summaries
Performance: Efficient for write-heavy workloads and time-series data

📊 Database Schema
Collection: events
javascript{
  _id: ObjectId,
  site_id: String,        // Required - Website identifier
  event_type: String,     // Required - Type of event (e.g., "page_view")
  path: String,           // URL path visited
  user_id: String,        // User identifier
  timestamp: Date,        // Event timestamp (ISO 8601)
  created_at: Date        // Record creation time
}
Indexes:

site_id + timestamp: For efficient date-range queries
site_id + user_id: For unique user counting

🚀 Setup Instructions
Prerequisites

Node.js (v18 or higher)
Docker Desktop (for Redis)
MongoDB (local or Atlas)
pnpm (package manager)

Step 1: Clone the Repository
bashgit clone <repository-url>
cd Internship_Assessment
Step 2: Install Dependencies
bashpnpm install
Step 3: Configure Environment Variables
Create a .env file in the root directory:
env# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/analytics
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Service Ports
INGESTION_PORT=3000
REPORTING_PORT=3001
Step 4: Start Redis (Docker)
bashdocker run -d --name redis-analytics -p 6379:6379 redis:alpine
Verify Redis is running:
bashdocker ps
Step 5: Build TypeScript Code
bashpnpm run build
Step 6: Start All Services
Open three separate terminal windows and run:
Terminal 1 - Ingestion API:
bashpnpm run start:ingestion
Terminal 2 - Reporting API:
bashpnpm run start:reporting
Terminal 3 - Processor Worker:
bashpnpm run start:processor
You should see:

Ingestion API: Ingestion API running on port 3000
Reporting API: Reporting API running on port 3001
Processor Worker: Worker started and waiting for jobs...

📡 API Usage
1. Ingest Events (POST /event)
Endpoint: http://localhost:3000/event
Single Event:
bashcurl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-abc-123",
    "event_type": "page_view",
    "path": "/pricing",
    "user_id": "user-xyz-789",
    "timestamp": "2025-11-12T19:30:01Z"
  }'
Success Response:
json{
  "success": true,
  "message": "Event queued successfully"
}
Load Testing (Multiple Events):
bash# Event 1
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-abc-123",
    "event_type": "page_view",
    "path": "/pricing",
    "user_id": "user-001",
    "timestamp": "2025-11-12T10:00:00Z"
  }'

# Event 2
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-abc-123",
    "event_type": "page_view",
    "path": "/blog/post-1",
    "user_id": "user-002",
    "timestamp": "2025-11-12T10:05:00Z"
  }'

# Event 3 (same user, different path)
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "site-abc-123",
    "event_type": "page_view",
    "path": "/pricing",
    "user_id": "user-001",
    "timestamp": "2025-11-12T10:10:00Z"
  }'
2. Get Analytics (GET /stats)
Endpoint: http://localhost:3001/stats
Query Parameters:

site_id (required): Website identifier
date (optional): Date in YYYY-MM-DD format

Get Stats for Specific Date:
bashcurl "http://localhost:3001/stats?site_id=site-abc-123&date=2025-11-12"
Get All-Time Stats:
bashcurl "http://localhost:3001/stats?site_id=site-abc-123"
Success Response:
json{
  "site_id": "site-abc-123",
  "date": "2025-11-12",
  "total_views": 1450,
  "unique_users": 212,
  "top_paths": [
    {
      "path": "/pricing",
      "views": 700
    },
    {
      "path": "/blog/post-1",
      "views": 500
    },
    {
      "path": "/",
      "views": 250
    }
  ]
}
🔍 Troubleshooting
Redis Connection Failed
bash# Check if Redis container is running
docker ps

# Restart Redis
docker restart redis-analytics

# View Redis logs
docker logs redis-analytics
MongoDB Connection Failed
bash# Check MongoDB status (local installation)
sudo systemctl status mongod

# Or check connection string in .env file
Processor Not Processing Events
bash# Check processor logs in the terminal
# Verify Redis and MongoDB connections
# Check BullMQ dashboard (optional): npm install -g bull-board
Events Not Appearing in Stats

Wait a few seconds for the processor to complete
Check processor terminal for errors
Verify MongoDB has the events: db.events.find()

🧪 Testing the System
Quick Test Flow

Start all three services
Send a test event to ingestion API
Wait 2-3 seconds for processing
Query the reporting API
Verify the statistics are updated

Performance Test
bash# Install Apache Bench (optional)
apt-get install apache2-utils

# Send 1000 requests with 10 concurrent connections
ab -n 1000 -c 10 -p event.json -T application/json http://localhost:3000/event
```

## 📁 Project Structure
```
Internship_Assessment/
├── src/
│   ├── ingestion/
│   │   └── server.ts          # Ingestion API
│   ├── processor/
│   │   └── worker.ts          # Background processor
│   ├── reporting/
│   │   └── server.ts          # Reporting API
│   └── config/
│       ├── database.ts        # MongoDB connection
│       └── queue.ts           # BullMQ configuration
├── JS/                        # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env
└── README.md
🔐 Production Considerations
For production deployment, consider:

Environment Variables: Use proper secret management (AWS Secrets Manager, etc.)
Redis Cluster: Deploy Redis in cluster mode for high availability
MongoDB Replica Set: Use replica sets for data redundancy
Load Balancer: Distribute traffic across multiple ingestion API instances
Monitoring: Add logging (Winston), metrics (Prometheus), and alerting
Rate Limiting: Implement rate limiting to prevent abuse
Data Retention: Set up TTL indexes to automatically delete old events
Horizontal Scaling: Run multiple processor workers for higher throughput

📝 License
ISC

Built with ❤️ using Node.js, TypeScript, BullMQ, Redis, and MongoDB