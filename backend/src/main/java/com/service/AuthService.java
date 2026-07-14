package com.service;

import com.dto.auth.AuthResponse;
import com.dto.auth.GoogleTokenInfoResponse;
import com.dto.auth.LoginRequest;
import com.dto.auth.SignupRequest;
import com.entity.Department;
import com.entity.Employee;
import com.entity.Role;
import com.entity.User;
import com.repository.DepartmentRepository;
import com.repository.EmployeeRepository;
import com.repository.RoleRepository;
import com.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String EMPLOYEE_ROLE = "EMPLOYEE";
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenService googleTokenService;

    @Value("${AUTH_ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${AUTH_ADMIN_PASSWORD}")
    private String adminPassword;

    @Transactional
    public void ensureAdminAccount() {
        Role adminRole = getOrCreateRole(ADMIN_ROLE, "System administrator with full access");
        Department adminDepartment = getOrCreateDepartment("Administration");

        Employee employee = employeeRepository.findByEmail(adminEmail)
                .orElseGet(() -> employeeRepository.save(Employee.builder()
                        .employeeCode(generateEmployeeCode("ADMIN"))
                        .firstName("AssetFlow")
                        .lastName("Admin")
                        .email(adminEmail)
                        .department(adminDepartment)
                        .role(adminRole)
                        .designation("System Administrator")
                        .status(true)
                        .build()));

        employee.setDepartment(adminDepartment);
        employee.setRole(adminRole);
        employee.setDesignation("System Administrator");
        employee.setStatus(true);
        employeeRepository.save(employee);

        User user = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> User.builder()
                        .email(adminEmail)
                        .employee(employee)
                        .build());

        user.setEmployee(employee);
        user.setEmail(adminEmail);
        user.setIsActive(true);
        if (user.getPassword() == null || !passwordEncoder.matches(adminPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(adminPassword));
        }
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalize(request != null ? request.getEmail() : null);
        String password = request != null ? request.getPassword() : null;

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return failure("Email and password are required.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return failure("No account found for this email.");
        }

        User user = userOptional.get();
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            return failure("This account is inactive.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return failure("Invalid email or password.");
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        String role = resolveRole(user);
        return success("Login successful.", user, role);
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = normalize(request != null ? request.getEmail() : null);
        String password = request != null ? request.getPassword() : null;
        String fullName = request != null ? request.getFullName() : null;
        String departmentName = request != null ? request.getDepartment() : null;

        if (!StringUtils.hasText(fullName) || !StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return failure("Full name, email, and password are required.");
        }

        if (!StringUtils.hasText(departmentName) || "Select Department".equalsIgnoreCase(departmentName.trim())) {
            return failure("Please select a department.");
        }

        if (adminEmail.equalsIgnoreCase(email)) {
            return failure("This email is reserved for the administrator account.");
        }

        if (userRepository.existsByEmail(email) || employeeRepository.existsByEmail(email)) {
            return failure("An account already exists for this email.");
        }

        Role employeeRole = getOrCreateRole(EMPLOYEE_ROLE, "Standard employee access");
        Department department = getOrCreateDepartment(departmentName);

        String[] nameParts = splitFullName(fullName);
        Employee employee = employeeRepository.save(Employee.builder()
                .employeeCode(generateEmployeeCode(email))
                .firstName(nameParts[0])
                .lastName(nameParts[1])
                .email(email)
                .department(department)
                .role(employeeRole)
                .designation(StringUtils.hasText(request.getOrganizationName()) ? request.getOrganizationName().trim() : "Employee")
                .status(true)
                .build());

        User user = userRepository.save(User.builder()
                .employee(employee)
                .email(email)
                .password(passwordEncoder.encode(password))
                .isActive(true)
                .build());

        return success("Account created successfully.", user, EMPLOYEE_ROLE);
    }

    @Transactional
    public AuthResponse googleLogin(String accessToken) {
        GoogleTokenInfoResponse googleToken = googleTokenService.verifyAccessToken(accessToken);
        String email = normalize(googleToken.getEmail());

        if (!StringUtils.hasText(email)) {
            return failure("Google account email is missing.");
        }

        String roleName = adminEmail.equalsIgnoreCase(email) ? ADMIN_ROLE : EMPLOYEE_ROLE;
        Role role = getOrCreateRole(roleName, ADMIN_ROLE.equals(roleName)
                ? "System administrator with full access"
                : "Standard employee access");
        Department department = getOrCreateDepartment(ADMIN_ROLE.equals(roleName) ? "Administration" : "General");

        String displayName = StringUtils.hasText(googleToken.getName()) ? googleToken.getName().trim() : email;
        String[] nameParts = splitFullName(displayName);

        Employee employee = employeeRepository.findByEmail(email)
            .orElse(null);
        if (employee == null) {
            employee = employeeRepository.save(Employee.builder()
                .employeeCode(generateEmployeeCode(email))
                .firstName(nameParts[0])
                .lastName(nameParts[1])
                .email(email)
                .department(department)
                .role(role)
                .designation(ADMIN_ROLE.equals(roleName) ? "System Administrator" : "Employee")
                .profileImage(googleToken.getPicture())
                .status(true)
                .build());
        }

        employee.setFirstName(nameParts[0]);
        employee.setLastName(nameParts[1]);
        employee.setDepartment(department);
        employee.setRole(role);
        employee.setDesignation(ADMIN_ROLE.equals(roleName) ? "System Administrator" : "Employee");
        employee.setProfileImage(googleToken.getPicture());
        employee.setStatus(true);
        employee = employeeRepository.save(employee);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                .employee(employee)
                .email(email)
                .build();
        }

        user.setEmployee(employee);
        user.setEmail(email);
        user.setIsActive(true);
        user.setLastLogin(java.time.LocalDateTime.now());
        if (!StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        user = userRepository.save(user);

        return success(ADMIN_ROLE.equals(roleName) ? "Welcome back, Admin." : "Google sign-in successful.", user, roleName);
    }

    private AuthResponse success(String message, User user, String role) {
        return AuthResponse.builder()
                .success(true)
                .message(message)
                .role(role)
                .displayName(buildDisplayName(user.getEmployee()))
                .email(user.getEmail())
                .token(jwtService.generateToken(user, role))
                .build();
    }

    private AuthResponse failure(String message) {
        return AuthResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    private String resolveRole(User user) {
        if (user.getEmployee() != null && user.getEmployee().getRole() != null && StringUtils.hasText(user.getEmployee().getRole().getRoleName())) {
            return user.getEmployee().getRole().getRoleName().trim().toUpperCase(Locale.ROOT);
        }
        return EMPLOYEE_ROLE;
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findByRoleNameIgnoreCase(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleName)
                        .description(description)
                        .build()));
    }

    private Department getOrCreateDepartment(String departmentName) {
        String cleanedName = StringUtils.hasText(departmentName) ? departmentName.trim() : "General";
        return departmentRepository.findByDepartmentNameIgnoreCase(cleanedName)
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .departmentName(cleanedName)
                        .status(true)
                        .build()));
    }

    private String[] splitFullName(String fullName) {
        String cleanedName = fullName.trim().replaceAll("\\s+", " ");
        String[] parts = cleanedName.split(" ", 2);
        if (parts.length == 1) {
            return new String[] { parts[0], "Employee" };
        }
        return new String[] { parts[0], parts[1] };
    }

    private String buildDisplayName(Employee employee) {
        if (employee == null) {
            return "Employee";
        }

        String firstName = StringUtils.hasText(employee.getFirstName()) ? employee.getFirstName().trim() : "";
        String lastName = StringUtils.hasText(employee.getLastName()) ? employee.getLastName().trim() : "";
        String displayName = (firstName + " " + lastName).trim();
        return StringUtils.hasText(displayName) ? displayName : employee.getEmail();
    }

    private String generateEmployeeCode(String seed) {
        String token = UUID.nameUUIDFromBytes(seed.getBytes()).toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        return "EMP-" + token;
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : null;
    }
}