package com.shopsphere.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String store(
            MultipartFile file,
            String directory
    );

    Resource load(
            String fileName,
            String directory
    );

    void delete(
            String fileName,
            String directory
    );
}
