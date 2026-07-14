package com.service;

import com.entity.Resource;
import com.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        List<Resource> list = resourceRepository.findAll();
        if (list.isEmpty()) {
            // Seed default resources
            resourceRepository.save(Resource.builder().resourceName("Conference Room B2").resourceType("Meeting Room").capacity(12).location("HQ Floor 2").status("Available").build());
            resourceRepository.save(Resource.builder().resourceName("Conference Room A1").resourceType("Meeting Room").capacity(8).location("HQ Floor 1").status("Available").build());
            resourceRepository.save(Resource.builder().resourceName("Lab 3 — Electronics").resourceType("Lab").capacity(20).location("Engineering Wing").status("Available").build());
            resourceRepository.save(Resource.builder().resourceName("Training Hall").resourceType("Hall").capacity(50).location("Annex Bldg").status("Available").build());
            resourceRepository.save(Resource.builder().resourceName("Meeting Pod 1").resourceType("Pod").capacity(4).location("HQ Floor 2").status("Available").build());
            resourceRepository.save(Resource.builder().resourceName("Board Room").resourceType("Meeting Room").capacity(16).location("HQ Floor 3").status("Available").build());
            return resourceRepository.findAll();
        }
        return list;
    }

    @Transactional
    public Resource createResource(String name, String type, Integer capacity, String location) {
        Resource r = Resource.builder()
                .resourceName(name)
                .resourceType(type)
                .capacity(capacity)
                .location(location)
                .status("Available")
                .build();
        return resourceRepository.save(r);
    }
}
