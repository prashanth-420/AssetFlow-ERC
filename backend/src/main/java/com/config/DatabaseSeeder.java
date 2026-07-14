package com.config;

import com.entity.*;
import com.enums.*;
import com.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@Order(2)
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AssetCategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final ResourceRepository resourceRepository;
    private final PasswordEncoder passwordEncoder;

    // Seeding remaining tables
    private final AssetAllocationRepository allocationRepository;
    private final AssetTransferRequestRepository transferRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final AuditCycleRepository auditCycleRepository;
    private final AuditEntryRepository auditEntryRepository;
    private final ResourceBookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    public void run(String... args) {
        try {
            seedRoles();
        } catch (Exception e) {
            System.err.println("Skipping roles: " + e.getMessage());
        }

        try {
            seedDepartments();
        } catch (Exception e) {
            System.err.println("Skipping departments: " + e.getMessage());
        }

        try {
            seedEmployeesAndUsers();
        } catch (Exception e) {
            System.err.println("Skipping employees: " + e.getMessage());
        }

        try {
            seedCategories();
        } catch (Exception e) {
            System.err.println("Skipping categories: " + e.getMessage());
        }

        try {
            seedAssets();
        } catch (Exception e) {
            System.err.println("Skipping assets: " + e.getMessage());
        }

        try {
            seedResources();
        } catch (Exception e) {
            System.err.println("Skipping resources: " + e.getMessage());
        }

        // Seeding remaining prototype logs and bookings
        try {
            seedRemainingPrototypeData();
        } catch (Exception e) {
            System.err.println("Skipping transactional prototype data: " + e.getMessage());
        }
    }

    private void seedRoles() {
        if (roleRepository.count() <= 1) {
            getOrCreateRole("ASSET_MANAGER", "Asset management and lifecycles coordinator");
            getOrCreateRole("DEPARTMENT_HEAD", "Department head with request approval authority");
            getOrCreateRole("EMPLOYEE", "Regular employee with allocation holdings");
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() <= 1) {
            getOrCreateDepartment("Engineering");
            getOrCreateDepartment("IT Operations");
            getOrCreateDepartment("Human Resources");
            getOrCreateDepartment("Finance");
            getOrCreateDepartment("Global Operations");
        }
    }

    private void seedEmployeesAndUsers() {
        if (employeeRepository.count() <= 1) {
            Role managerRole = roleRepository.findByRoleNameIgnoreCase("ASSET_MANAGER").orElse(null);
            Role headRole = roleRepository.findByRoleNameIgnoreCase("DEPARTMENT_HEAD").orElse(null);
            Role empRole = roleRepository.findByRoleNameIgnoreCase("EMPLOYEE").orElse(null);

            Department engDept = departmentRepository.findByDepartmentNameIgnoreCase("Engineering").orElse(null);
            Department itDept = departmentRepository.findByDepartmentNameIgnoreCase("IT Operations").orElse(null);
            Department opsDept = departmentRepository.findByDepartmentNameIgnoreCase("Global Operations").orElse(null);

            // Priya Shah - Department Head
            Employee priya = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP-002")
                    .firstName("Priya")
                    .lastName("Shah")
                    .email("priya@gmail.com")
                    .phone("+91 9876543210")
                    .department(engDept)
                    .role(headRole)
                    .designation("Engineering Director")
                    .status(true)
                    .build());
            createLoginUser("priya@gmail.com", priya);

            // Ramesh Varma - Asset Manager
            Employee ramesh = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP-003")
                    .firstName("Ramesh")
                    .lastName("Varma")
                    .email("ramesh@gmail.com")
                    .phone("+91 9876543211")
                    .department(itDept)
                    .role(managerRole)
                    .designation("IT Operations Lead")
                    .status(true)
                    .build());
            createLoginUser("ramesh@gmail.com", ramesh);

            // Sarah Chen - Regular Employee
            Employee sarah = employeeRepository.save(Employee.builder()
                    .employeeCode("EMP-004")
                    .firstName("Sarah")
                    .lastName("Chen")
                    .email("sarah@gmail.com")
                    .phone("+1 555-019-2834")
                    .department(opsDept)
                    .role(empRole)
                    .designation("Operations Associate")
                    .status(true)
                    .profileImage("https://lh3.googleusercontent.com/aida-public/AB6AXuAEhGD05nqOBGuK2c6w1SDZbJ4RD_jzNxhEsYTbQ5STMlULEhjT2zOyRGSBRyFzXAnT3Pm3GrTL-Vn_r0WJTO7kuUxgHsIP0SN5rIcAonNVxLuFiJOgjMQu8NsOufVBUd0SR7A2YgOD71m2z4Y_PScCSXcfmDIgcV6_jAWnWHsHFpA2hAvb1E-PmA0qTwV6K5zF_olakMQFEw6k2dnnK0IDDUbNyeujJSwrLIR0--lRpUyLoD2r")
                    .build());
            createLoginUser("sarah@gmail.com", sarah);
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            getOrCreateCategory("Electronics", "Hardware, workstations, and consumer electronics");
            getOrCreateCategory("Furniture", "Desks, task chairs, and office layouts");
            getOrCreateCategory("Hardware", "Networking cables, tooling, and accessories");
            getOrCreateCategory("Vehicles", "Company cars and logistics fleet");
        }
    }

    private void seedAssets() {
        if (assetRepository.count() == 0) {
            AssetCategory electronics = categoryRepository.findByCategoryNameIgnoreCase("Electronics").orElse(null);
            AssetCategory furniture = categoryRepository.findByCategoryNameIgnoreCase("Furniture").orElse(null);

            Department engDept = departmentRepository.findByDepartmentNameIgnoreCase("Engineering").orElse(null);
            Department itDept = departmentRepository.findByDepartmentNameIgnoreCase("IT Operations").orElse(null);

            assetRepository.save(Asset.builder()
                    .assetTag("AF-001")
                    .assetName("MacBook Pro 16\"")
                    .category(electronics)
                    .serialNumber("MBP16-928374-E")
                    .purchaseDate(LocalDate.now().minusDays(90))
                    .purchaseCost(new BigDecimal("2499.00"))
                    .condition("9/10")
                    .status(AssetStatus.AVAILABLE)
                    .location("Desk E12")
                    .department(engDept)
                    .vendor("Apple Store Bangalore")
                    .warrantyExpiry(LocalDate.now().plusYears(1))
                    .isBookable(false)
                    .build());

            assetRepository.save(Asset.builder()
                    .assetTag("AF-002")
                    .assetName("Ergonomic Task Chair")
                    .category(furniture)
                    .serialNumber("CHAIR-110293-C")
                    .purchaseDate(LocalDate.now().minusDays(180))
                    .purchaseCost(new BigDecimal("499.00"))
                    .condition("8/10")
                    .status(AssetStatus.AVAILABLE)
                    .location("Desk E14")
                    .department(engDept)
                    .vendor("Featherlite Systems")
                    .warrantyExpiry(LocalDate.now().plusYears(2))
                    .isBookable(false)
                    .build());

            assetRepository.save(Asset.builder()
                    .assetTag("AF-003")
                    .assetName("Conference B2 Projector")
                    .category(electronics)
                    .serialNumber("PROJ-883721-M")
                    .purchaseDate(LocalDate.now().minusDays(365))
                    .purchaseCost(new BigDecimal("1200.00"))
                    .condition("7/10")
                    .status(AssetStatus.AVAILABLE)
                    .location("Conference Room B2")
                    .department(itDept)
                    .vendor("Epson Distribution")
                    .warrantyExpiry(LocalDate.now().plusYears(1))
                    .isBookable(true)
                    .build());
        }
    }

    private void seedResources() {
        if (resourceRepository.count() == 0) {
            resourceRepository.save(Resource.builder()
                    .resourceName("Conference Room B2")
                    .resourceType("ROOM")
                    .capacity(12)
                    .location("B-Wing, Floor 2")
                    .status("Available")
                    .build());

            resourceRepository.save(Resource.builder()
                    .resourceName("Conference Room A1")
                    .resourceType("ROOM")
                    .capacity(8)
                    .location("A-Wing, Floor 1")
                    .status("Available")
                    .build());

            resourceRepository.save(Resource.builder()
                    .resourceName("Lab 3 — Electronics")
                    .resourceType("LAB")
                    .capacity(20)
                    .location("Main Wing, Floor 3")
                    .status("Available")
                    .build());

            resourceRepository.save(Resource.builder()
                    .resourceName("Delivery Van AF-343")
                    .resourceType("VEHICLE")
                    .capacity(5)
                    .location("Basement Garage")
                    .status("Available")
                    .build());
        }
    }

    private void seedRemainingPrototypeData() {
        if (allocationRepository.count() == 0) {
            Asset macbook = assetRepository.findByAssetTagIgnoreCase("AF-001").orElse(null);
            Asset chair = assetRepository.findByAssetTagIgnoreCase("AF-002").orElse(null);
            Asset projector = assetRepository.findByAssetTagIgnoreCase("AF-003").orElse(null);

            Employee priya = employeeRepository.findByEmail("priya@gmail.com").orElse(null);
            Employee sarah = employeeRepository.findByEmail("sarah@gmail.com").orElse(null);
            Employee ramesh = employeeRepository.findByEmail("ramesh@gmail.com").orElse(null);

            Department engDept = departmentRepository.findByDepartmentNameIgnoreCase("Engineering").orElse(null);
            Department itDept = departmentRepository.findByDepartmentNameIgnoreCase("IT Operations").orElse(null);

            // Allocations
            if (macbook != null && priya != null) {
                macbook.setStatus(AssetStatus.ALLOCATED);
                assetRepository.save(macbook);

                allocationRepository.save(AssetAllocation.builder()
                        .asset(macbook)
                        .employee(priya)
                        .department(engDept)
                        .allocatedBy(ramesh)
                        .allocatedDate(LocalDate.now().minusDays(15))
                        .expectedReturnDate(LocalDate.now().plusDays(45))
                        .status("Active")
                        .conditionNotes("Excellent condition, pre-configured with dev profiles")
                        .build());
            }

            if (chair != null && sarah != null) {
                chair.setStatus(AssetStatus.ALLOCATED);
                assetRepository.save(chair);

                allocationRepository.save(AssetAllocation.builder()
                        .asset(chair)
                        .employee(sarah)
                        .department(engDept)
                        .allocatedBy(ramesh)
                        .allocatedDate(LocalDate.now().minusDays(10))
                        .expectedReturnDate(LocalDate.now().plusDays(90))
                        .status("Active")
                        .conditionNotes("Brand new alignment pins set")
                        .build());
            }

            // Transfer Requests
            if (macbook != null && priya != null && sarah != null) {
                transferRepository.save(AssetTransferRequest.builder()
                        .asset(macbook)
                        .fromEmployee(priya)
                        .toEmployee(sarah)
                        .requestedBy(priya)
                        .status(TransferStatus.REQUESTED)
                        .remarks("Project reassignment to Creative team")
                        .requestedDate(LocalDateTime.now().minusHours(4))
                        .build());
            }

            // Maintenance Requests
            if (projector != null && sarah != null) {
                maintenanceRepository.save(MaintenanceRequest.builder()
                        .asset(projector)
                        .raisedBy(sarah)
                        .issueDescription("Projector bulb not turning on, replacement required")
                        .priority("High")
                        .status(MaintenanceStatus.PENDING)
                        .build());
            }

            // Audit Cycles & Entries
            if (engDept != null && ramesh != null) {
                AuditCycle cycle = auditCycleRepository.save(AuditCycle.builder()
                        .auditName("Q3 Engineering Asset Verification")
                        .department(engDept)
                        .location("Bangalore HQ")
                        .startDate(LocalDate.now().minusDays(5))
                        .endDate(LocalDate.now().plusDays(10))
                        .status(AuditStatus.IN_PROGRESS)
                        .createdBy(ramesh)
                        .build());

                if (macbook != null) {
                    auditEntryRepository.save(AuditEntry.builder()
                            .audit(cycle)
                            .asset(macbook)
                            .auditor(ramesh)
                            .verificationStatus(VerificationStatus.VERIFIED)
                            .remarks("Verified at Desk E12")
                            .verifiedAt(LocalDateTime.now().minusDays(1))
                            .build());
                }

                if (chair != null) {
                    auditEntryRepository.save(AuditEntry.builder()
                            .audit(cycle)
                            .asset(chair)
                            .auditor(ramesh)
                            .verificationStatus(VerificationStatus.DAMAGED)
                            .remarks("Pending physical alignment scan")
                            .build());
                }
            }

            // Resource Bookings
            Resource confB2 = resourceRepository.findAll().stream()
                    .filter(r -> r.getResourceName().equals("Conference Room B2"))
                    .findFirst().orElse(null);

            if (confB2 != null && priya != null) {
                bookingRepository.save(ResourceBooking.builder()
                        .resource(confB2)
                        .employee(priya)
                        .department(engDept)
                        .purpose("Engineering Sprint Design Review")
                        .startDatetime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0))
                        .endDatetime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).withSecond(0))
                        .status(BookingStatus.UPCOMING)
                        .build());
            }

            // Notifications
            if (priya != null) {
                notificationRepository.save(Notification.builder()
                        .employee(priya)
                        .title("Asset Allocated Successfully")
                        .message("MacBook Pro 16\" has been signed out and registered under your profile")
                        .isRead(false)
                        .build());
            }

            // Activity Logs
            activityLogRepository.save(ActivityLog.builder()
                    .module("ALLOCATION")
                    .action("ALLOCATE")
                    .description("MacBook Pro 16\" sign-out completed by Ramesh Varma for Priya Shah")
                    .ipAddress("127.0.0.1")
                    .build());

            activityLogRepository.save(ActivityLog.builder()
                    .module("MAINTENANCE")
                    .action("CREATE")
                    .description("Service ticket raised for Conference B2 Projector")
                    .ipAddress("192.168.1.52")
                    .build());
        }
    }

    private Role getOrCreateRole(String name, String desc) {
        return roleRepository.findByRoleNameIgnoreCase(name)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(name)
                        .description(desc)
                        .build()));
    }

    private Department getOrCreateDepartment(String name) {
        return departmentRepository.findByDepartmentNameIgnoreCase(name)
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .departmentName(name)
                        .status(true)
                        .build()));
    }

    private void getOrCreateCategory(String name, String desc) {
        categoryRepository.findByCategoryNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(AssetCategory.builder()
                        .categoryName(name)
                        .description(desc)
                        .build()));
    }

    private void createLoginUser(String email, Employee employee) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("kittu123"))
                    .employee(employee)
                    .isActive(true)
                    .build());
        }
    }
}
