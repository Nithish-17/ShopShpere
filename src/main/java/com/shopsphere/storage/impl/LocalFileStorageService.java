package com.shopsphere.storage.impl;

import com.shopsphere.storage.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileStorageService
        implements FileStorageService {

    private final Path storageRoot;

    public LocalFileStorageService(
            @Value("${app.file.storage.product-images}")
            String storageDirectory) {

        this.storageRoot =
                Paths.get(storageDirectory)
                        .toAbsolutePath()
                        .normalize();
    }

    @Override
    public String store(MultipartFile file, String directory) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        try {

            Path targetDirectory =
                    storageRoot
                            .resolve(directory)
                            .normalize();

            Files.createDirectories(targetDirectory);

            String originalFilename =
                    file.getOriginalFilename();

            String extension =
                    getExtension(originalFilename);

            String storedFilename =
                    UUID.randomUUID()
                            + extension;

            Path targetFile =
                    targetDirectory
                            .resolve(storedFilename)
                            .normalize();

            /*
             * Security check.
             *
             * Prevents the resolved path from
             * escaping our storage directory.
             */
            if (!targetFile.startsWith(
                    targetDirectory)) {

                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            try (InputStream inputStream =
                         file.getInputStream()) {

                Files.copy(
                        inputStream,
                        targetFile,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            return storedFilename;

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to store file.",
                    ex
            );
        }
    }

    @Override
    public Resource load(
            String fileName,
            String directory) {

        try {

            Path targetDirectory =
                    storageRoot
                            .resolve(directory)
                            .normalize();

            Path file =
                    targetDirectory
                            .resolve(fileName)
                            .normalize();

            if (!file.startsWith(targetDirectory)) {

                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Resource resource =
                    new UrlResource(
                            file.toUri()
                    );

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new RuntimeException(
                        "File not found."
                );
            }

            return resource;

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to load file.",
                    ex
            );
        }
    }

    @Override
    public void delete(
            String fileName,
            String directory) {

        try {

            Path targetDirectory =
                    storageRoot
                            .resolve(directory)
                            .normalize();

            Path file =
                    targetDirectory
                            .resolve(fileName)
                            .normalize();

            if (!file.startsWith(targetDirectory)) {

                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Files.deleteIfExists(file);

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Failed to delete file.",
                    ex
            );
        }
    }

    private String getExtension(
            String filename) {

        if (filename == null
                || filename.isBlank()) {

            return "";
        }

        int index =
                filename.lastIndexOf('.');

        if (index == -1) {
            return "";
        }

        return filename.substring(index);
    }
}