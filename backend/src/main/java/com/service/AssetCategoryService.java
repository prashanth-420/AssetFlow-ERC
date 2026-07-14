package com.service;

import com.entity.AssetCategory;
import com.repository.AssetCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetCategoryService {

    private final AssetCategoryRepository assetCategoryRepository;

    public List<AssetCategory> getAllCategories() {
        return assetCategoryRepository.findAll();
    }

    @Transactional
    public AssetCategory createCategory(String name, String description) {
        if (assetCategoryRepository.existsByCategoryNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Asset category already exists.");
        }
        AssetCategory category = AssetCategory.builder()
                .categoryName(name)
                .description(description)
                .build();
        return assetCategoryRepository.save(category);
    }

    @Transactional
    public AssetCategory updateCategory(Long id, String name, String description) {
        AssetCategory category = assetCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset category not found."));
        if (name != null) {
            category.setCategoryName(name);
        }
        if (description != null) {
            category.setDescription(description);
        }
        return assetCategoryRepository.save(category);
    }
}
