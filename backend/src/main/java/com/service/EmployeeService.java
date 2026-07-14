package com.service;

import com.entity.Employee;
import com.entity.Role;
import com.repository.EmployeeRepository;
import com.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional
    public Employee promoteEmployee(Long id, String roleName) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found."));

        Role role = roleRepository.findByRoleNameIgnoreCase(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleName.toUpperCase())
                        .description("Promoted access level")
                        .build()));

        employee.setRole(role);
        return employeeRepository.save(employee);
    }
}
