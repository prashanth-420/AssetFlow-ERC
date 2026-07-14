package com.repository;

import com.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    Optional<AssetCategory> findByCategoryNameIgnoreCase(String categoryName);
    boolean existsByCategoryNameIgnoreCase(String categoryName);
}
