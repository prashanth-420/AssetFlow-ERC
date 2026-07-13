# 🚀 AssetFlow -- Enterprise Asset & Resource Management System

> **A modern ERP solution for managing organizational assets, shared
> resources, maintenance, audits, and lifecycle tracking through secure
> role-based workflows.**

------------------------------------------------------------------------

## 📖 Overview

AssetFlow is a comprehensive **Enterprise Asset & Resource Management
System (ERP)** designed to help organizations digitize and streamline
the management of physical assets and shared resources.

Organizations often rely on spreadsheets, paper logs, and manual
approvals to manage laptops, furniture, vehicles, meeting rooms, lab
equipment, and other organizational resources. AssetFlow centralizes
these operations into a secure, scalable, and user-friendly platform.

------------------------------------------------------------------------

# 🎯 Problem Statement

AssetFlow solves common operational challenges such as:

-   Manual asset tracking
-   Duplicate asset allocation
-   Resource booking conflicts
-   Delayed maintenance approvals
-   Inefficient audit management
-   Poor operational visibility
-   Missing accountability
-   Lack of historical asset tracking
-   Limited reporting and analytics

------------------------------------------------------------------------

# ✨ Features

## 🔐 Authentication & Security

-   Employee Signup
-   Secure Login
-   JWT Authentication
-   Password Encryption (BCrypt)
-   Forgot Password
-   Session Validation
-   Role-Based Authorization

------------------------------------------------------------------------

## 👥 User Roles

### Admin

-   Manage Departments
-   Manage Asset Categories
-   Manage Employee Directory
-   Promote Employees to Asset Manager / Department Head
-   View Reports & Analytics

### Asset Manager

-   Register Assets
-   Allocate Assets
-   Approve Transfers
-   Approve Maintenance
-   Approve Returns
-   Manage Audits

### Department Head

-   View Department Assets
-   Approve Department Transfers
-   Book Shared Resources

### Employee

-   View Assigned Assets
-   Book Resources
-   Raise Maintenance Requests
-   Request Transfers
-   Request Returns

------------------------------------------------------------------------

# 🏢 Organization Management

-   Department Management
-   Parent Department Hierarchy
-   Employee Directory
-   Asset Category Management

------------------------------------------------------------------------

# 💻 Asset Management

Supports:

-   Laptops
-   Desktops
-   Furniture
-   Vehicles
-   Cameras
-   Projectors
-   Printers
-   Medical Equipment
-   Lab Equipment
-   Shared Resources

Each asset contains:

-   Asset Tag
-   QR Code
-   Category
-   Serial Number
-   Purchase Date
-   Purchase Cost
-   Warranty
-   Location
-   Department
-   Current Holder
-   Images
-   Documents
-   Condition
-   Lifecycle Status

------------------------------------------------------------------------

# 🔄 Asset Lifecycle

``` text
Draft
 ↓
Registered
 ↓
Available
 ↓
Reserved
 ↓
Allocated
 ↓
Transfer Requested
 ↓
Transferred
 ↓
Returned
 ↓
Inspection
 ↓
Available
 ↓
Under Maintenance
 ↓
Available
 ↓
Lost
 ↓
Recovered
 ↓
Retired
 ↓
Disposed
```

------------------------------------------------------------------------

# 📦 Asset Allocation

-   Allocate to Employee/Department
-   Expected Return Date
-   Transfer Requests
-   Return Workflow
-   Allocation History
-   Condition Verification
-   Conflict Prevention

**Business Rule:** A single asset cannot be allocated to multiple users
simultaneously.

------------------------------------------------------------------------

# 📅 Resource Booking

-   Calendar View
-   Slot Booking
-   Overlap Validation
-   Booking Reminders
-   Rescheduling
-   Cancellation

------------------------------------------------------------------------

# 🛠 Maintenance Workflow

``` text
Pending
 ↓
Approved
 ↓
Technician Assigned
 ↓
In Progress
 ↓
Resolved
 ↓
Closed
```

Automatically updates asset status between **Available** and **Under
Maintenance**.

------------------------------------------------------------------------

# 🔍 Asset Audit

``` text
Create Audit
 ↓
Assign Auditor
 ↓
Verify Assets
 ↓
Generate Discrepancy Report
 ↓
Resolve Issues
 ↓
Close Audit
```

------------------------------------------------------------------------

# 🔔 Notifications

-   Asset Assigned
-   Transfer Approved
-   Booking Confirmation
-   Booking Reminder
-   Maintenance Approved
-   Maintenance Rejected
-   Overdue Return Alerts
-   Audit Assignment
-   Audit Discrepancies

------------------------------------------------------------------------

# 📊 Dashboard

Displays:

-   Available Assets
-   Allocated Assets
-   Assets Under Maintenance
-   Active Bookings
-   Pending Transfers
-   Upcoming Returns
-   Overdue Returns
-   Pending Maintenance

------------------------------------------------------------------------

# 📈 Reports & Analytics

-   Asset Utilization
-   Department-wise Allocation
-   Maintenance Trends
-   Booking Heatmap
-   Most Used Assets
-   Idle Assets
-   Assets Due for Maintenance

Export formats:

-   PDF
-   Excel
-   CSV

------------------------------------------------------------------------

# 📝 Activity Logs

Tracks:

-   User
-   Action
-   Module
-   Timestamp

------------------------------------------------------------------------

# 📱 QR Code Integration

Each asset is assigned a unique QR Code for quick access to:

-   Asset Details
-   Allocation History
-   Maintenance History
-   Current Status

------------------------------------------------------------------------

# 🛠 Technology Stack

## Frontend

-   React
-   JavaScript (ES6+)
-   Vite
-   Tailwind CSS
-   shadcn/ui
-   React Router DOM
-   Axios
-   React Hook Form
-   Zod
-   Recharts
-   FullCalendar

## Backend

-   Spring Boot
-   Spring Security
-   Spring Data JPA (Hibernate)
-   JWT Authentication
-   Maven

## Database

-   MySQL

## Additional Services

-   Cloudinary
-   ZXing (QR Code)
-   Apache POI
-   Spring Mail
-   WebSocket (Optional)

------------------------------------------------------------------------

# 🏛 System Architecture

``` text
                React + JavaScript
                        │
                 REST API Layer
                        │
                 Spring Boot Backend
                        │
 ┌────────────────────────────────────┐
 │ Authentication Module              │
 │ Organization Module                │
 │ Employee Module                    │
 │ Asset Module                       │
 │ Allocation Module                  │
 │ Booking Module                     │
 │ Maintenance Module                 │
 │ Audit Module                       │
 │ Reports Module                     │
 │ Notification Module                │
 │ Activity Log Module                │
 └────────────────────────────────────┘
                        │
                      MySQL
```

------------------------------------------------------------------------

# 📦 Core Modules

-   Authentication
-   Employee Management
-   Department Management
-   Asset Categories
-   Asset Registration
-   Asset Allocation
-   Asset Transfer
-   Resource Booking
-   Maintenance Management
-   Audit Management
-   Reports & Analytics
-   Notifications
-   Activity Logs

------------------------------------------------------------------------

# 🚀 Future Enhancements

-   AI Predictive Maintenance
-   RFID Integration
-   Mobile Application
-   Barcode Scanner Support
-   Multi-Tenant Organizations
-   OCR Invoice Processing
-   Asset Utilization Prediction

------------------------------------------------------------------------

# 📌 Target Organizations

-   Corporate Offices
-   Educational Institutions
-   Hospitals
-   Government Organizations
-   Manufacturing Industries
-   Warehouses
-   Logistics Companies
-   Research Laboratories

------------------------------------------------------------------------

# ⭐ Highlights

-   Enterprise-inspired architecture
-   Role-based access control
-   Complete asset lifecycle management
-   Conflict-free resource booking
-   Structured maintenance workflow
-   Audit management
-   Real-time dashboards
-   Exportable reports
-   QR code support
-   Responsive user interface
-   Scalable modular design

------------------------------------------------------------------------

## 📄 License

This project was developed as part of a hackathon for educational and
demonstration purposes.
#   A s s e t F l o w - E R C  
 