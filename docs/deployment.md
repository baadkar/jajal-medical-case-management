# AWS Production Hosting & Deployment Architecture

This document describes the recommended high-availability, HIPAA-aligned architecture for hosting the Jajal Medical Case Management system on Amazon Web Services (AWS).

---

## 1. Architectural Topology Overview

```text
[ Internet / Hospital Clients ]
              |
              v (Port 443 - HTTPS)
     [ AWS Route 53 DNS ]
              |
              v
[ Application Load Balancer (ALB) ]
  (AWS Certificate Manager SSL/TLS termination)
              |
              | (Private Subnet VPC)
              +--------------------------+
              |                          |
              v                          v
     [ EC2 Instance 1 ]         [ EC2 Instance 2 ]
     (Nginx + PHP-FPM / Node)   (Auto Scaling Group)
              |                          |
              +-------------+------------+
                            |
           +----------------+----------------+
           |                                 |
           v                                 v
[ Amazon RDS for MySQL ]            [ Amazon S3 Bucket ]
- Multi-AZ Deployment               - SSE-KMS 256-bit Encryption
- Encrypted storage (EBS KMS)       - Private access only via IAM
- Automated snapshots               - Patient DICOM & implant CAD
```

---

## 2. Component Specifications

### 1. Web & Application Tier (Amazon EC2)
- **Deployment**: EC2 instances (e.g., `t4g.medium` or `c6i.large`) running Ubuntu LTS behind an Application Load Balancer (ALB) within private VPC subnets.
- **Web Server**: Nginx configured as reverse proxy to PHP-FPM / Express process manager (PM2 / Supervisor).
- **Auto Scaling**: EC2 Auto Scaling Group (ASG) maintaining a minimum of 2 instances across separate Availability Zones (AZs) for high availability.

### 2. Relational Database Tier (Amazon RDS for MySQL 8.0)
- **Multi-AZ**: Synchronous standby replica in a secondary AZ for automated zero-downtime failover.
- **Encryption**: Storage encrypted at rest using AWS Key Management Service (AWS KMS `aws/rds`).
- **Backup & Retention**: Automated daily snapshots retained for 35 days with Point-In-Time Restore (PITR) to meet clinical data retention regulations.

### 3. File & Medical Asset Storage (Amazon S3)
- **Implant Scans & CAD**: Pre-operative CT/MRI scans and 3D implant STL/STEP files stored in a dedicated S3 bucket.
- **Security**: Default encryption with AWS KMS (SSE-KMS), Public Access Block strictly enabled, Versioning enabled, and Presigned URLs (with 15-minute expirations) generated for authorized clinicians.

### 4. Security Groups & Network Segmentation
Strict least-privilege network isolation across three distinct security tiers:
1. **ALB Security Group**:
   - Inbound: Ports `80` (redirect to `443`) and `443` (HTTPS) from `0.0.0.0/0`.
   - Outbound: Port `80`/`3000` only to the EC2 Security Group.
2. **EC2 Security Group**:
   - Inbound: Traffic permitted **only** from the ALB Security Group on the internal application port.
   - Outbound: All outbound traffic routed via NAT Gateway; database port `3306` permitted to RDS Security Group.
3. **RDS Security Group**:
   - Inbound: Port `3306` permitted **strictly from the EC2 Security Group**. No public IP or internet route allowed.

### 5. Secrets Management & Environment Isolation
- Sensitive variables (`DB_PASSWORD`, `APP_KEY`, `SANCTUM_SECRET`) are never committed to version control.
- Stored securely in **AWS Secrets Manager** or **AWS Systems Manager (SSM) Parameter Store** (SecureString).
- Retrieved dynamically upon deployment or injected into container / systemd service environments via IAM instance roles without hardcoded credentials.

### 6. SSL/TLS & HTTPS Configuration
- Free, auto-renewing SSL/TLS certificates issued via **AWS Certificate Manager (ACM)**.
- Bound directly to the Application Load Balancer.
- Security Policy enforces TLS 1.3 and TLS 1.2 modern ciphers with HTTP Strict Transport Security (HSTS) headers enabled.
