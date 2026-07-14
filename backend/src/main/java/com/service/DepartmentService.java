package com.service;

import com.entity.Department;
import com.entity.Employee;
import com.repository.DepartmentRepository;
import com.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(String name, Long headId, Long parentId, Boolean status) {
        Employee head = null;
        if (headId != null) {
            head = employeeRepository.findById(headId).orElse(null);
        }
        Department parent = null;
        if (parentId != null && parentId > 0) {
            parent = departmentRepository.findById(parentId).orElse(null);
        }

        Department dept = Department.builder()
                .departmentName(name)
                .departmentHead(head)
                .parentDepartment(parent)
                .status(status != null ? status : true)
                .build();

        return departmentRepository.save(dept);
    }

    @Transactional
    public Department updateDepartment(Long id, String name, Long headId, Long parentId, Boolean status) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found."));

        if (name != null) dept.setDepartmentName(name);
        
        if (headId != null && headId > 0) {
            Employee head = employeeRepository.findById(headId)
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found for Head."));
            dept.setDepartmentHead(head);
        } else {
            dept.setDepartmentHead(null);
        }

        if (parentId != null && parentId > 0) {
            Department parent = departmentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent department not found."));
            dept.setParentDepartment(parent);
        } else {
            dept.setParentDepartment(null);
        }

        if (status != null) dept.setStatus(status);

        return departmentRepository.save(dept);
    }
}
