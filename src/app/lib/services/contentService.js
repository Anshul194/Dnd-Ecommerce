import ContentRepository from '../repository/contentRepository.js';
import { saveFile, validateImageFile, deleteFile } from '../../config/fileUpload.js';

class ContentService {
  constructor(connection) {
    this.contentRepository = new ContentRepository(connection);
  }

  // Helper method to process file uploads in content
  async processContentFiles(content) {
    if (!content || typeof content !== 'object') return content;

    const processedContent = { ...content };
    
    // Process each field in content that might be a file
    for (const [key, value] of Object.entries(content)) {
      if (value instanceof File) {
        try {
          validateImageFile(value);
          // Save file and replace the File object with the URL
          const fileUrl = await saveFile(value, 'content-images');
          processedContent[key] = fileUrl;
          
          // Keep metadata
          processedContent[`${key}_name`] = value.name;
          processedContent[`${key}_size`] = value.size;
          processedContent[`${key}_type`] = value.type;
        } catch (fileError) {
          throw new Error(`File upload error for ${key}: ${fileError.message}`);
        }
      }
    }
    
    return processedContent;
  }

  // Create a new homepage section
  async createHomepageSection(sectionData, userId) {
    try {
      // Validate required fields
      if (!sectionData.sectionType) {
        throw new Error('Section type is required');
      }

      // Process file uploads in content
      let processedContent = sectionData.content;
      if (sectionData.content) {
        processedContent = await this.processContentFiles(sectionData.content);
      }

      // Add creator information
      const enrichedData = {
        ...sectionData,
        content: processedContent,
        createdBy: userId,
        updatedBy: userId
      };

      // Set default order if not provided
      if (!enrichedData.order) {
        const existingSections = await this.contentRepository.getAllSections(
          { sectionType: sectionData.sectionType }
        );
        enrichedData.order = existingSections.sections.length + 1;
      }

      return await this.contentRepository.createSection(enrichedData);
    } catch (error) {
      throw new Error(`Service error creating homepage section: ${error.message}`);
    }
  }

  // Bulk create homepage sections
  async bulkCreateHomepageSections(sectionsData, userId) {
    try {
      if (!Array.isArray(sectionsData) || sectionsData.length === 0) {
        throw new Error('Sections data must be a non-empty array');
      }

      const enrichedSections = [];
      
      for (let i = 0; i < sectionsData.length; i++) {
        const sectionData = sectionsData[i];
        
        // Validate required fields
        if (!sectionData.sectionType) {
          throw new Error(`Section type is required for section at index ${i}`);
        }

        // Process file uploads in content
        let processedContent = sectionData.content;
        if (sectionData.content) {
          processedContent = await this.processContentFiles(sectionData.content);
        }

        // Add creator information
        const enrichedData = {
          ...sectionData,
          content: processedContent,
          createdBy: userId,
          updatedBy: userId
        };

        // Set default order if not provided
        if (!enrichedData.order) {
          enrichedData.order = i + 1;
        }

        enrichedSections.push(enrichedData);
      }

      return await this.contentRepository.bulkCreateSections(enrichedSections);
    } catch (error) {
      throw new Error(`Service error bulk creating homepage sections: ${error.message}`);
    }
  }

  // Get all homepage sections with filtering and pagination
  async getHomepageSections(filters = {}, options = {}) {
    try {
      return await this.contentRepository.getAllSections(filters, options);
    } catch (error) {
      throw new Error(`Service error fetching homepage sections: ${error.message}`);
    }
  }

  // Get a single homepage section by ID
  async getHomepageSectionById(id) {
    try {
      if (!id) {
        throw new Error('Section ID is required');
      }
      return await this.contentRepository.getSectionById(id);
    } catch (error) {
      throw new Error(`Service error fetching homepage section: ${error.message}`);
    }
  }

  // Get sections by type
  async getSectionsByType(sectionType, isVisible = null) {
    try {
      if (!sectionType) {
        throw new Error('Section type is required');
      }
      return await this.contentRepository.getSectionsByType(sectionType, isVisible);
    } catch (error) {
      throw new Error(`Service error fetching sections by type: ${error.message}`);
    }
  }

  // Update a homepage section
  async updateHomepageSection(id, updateData, userId) {
    try {
      if (!id) {
        throw new Error('Section ID is required');
      }

      // Process file uploads in content
      let processedContent = updateData.content;
      if (updateData.content) {
        processedContent = await this.processContentFiles(updateData.content);
      }

      // Add updater information
      const enrichedData = {
        ...updateData,
        content: processedContent,
        updatedBy: userId
      };

      return await this.contentRepository.updateSection(id, enrichedData);
    } catch (error) {
      throw new Error(`Service error updating homepage section: ${error.message}`);
    }
  }

  // Delete a homepage section
  async deleteHomepageSection(id) {
    try {
      if (!id) {
        throw new Error('Section ID is required');
      }
      return await this.contentRepository.deleteSection(id);
    } catch (error) {
      throw new Error(`Service error deleting homepage section: ${error.message}`);
    }
  }

  // Toggle section visibility
  async toggleSectionVisibility(id, isVisible) {
    try {
      if (!id) {
        throw new Error('Section ID is required');
      }
      if (typeof isVisible !== 'boolean') {
        throw new Error('Visibility must be a boolean value');
      }
      return await this.contentRepository.toggleVisibility(id, isVisible);
    } catch (error) {
      throw new Error(`Service error updating section visibility: ${error.message}`);
    }
  }

  // Reorder sections
  async reorderSections(sectionsOrder) {
    try {
      if (!Array.isArray(sectionsOrder) || sectionsOrder.length === 0) {
        throw new Error('Sections order must be a non-empty array');
      }

      // Validate each item has required fields
      for (const item of sectionsOrder) {
        if (!item.id) {
          throw new Error('Each section must have an ID');
        }
      }

      return await this.contentRepository.reorderSections(sectionsOrder);
    } catch (error) {
      throw new Error(`Service error reordering sections: ${error.message}`);
    }
  }

  // Get visible sections for frontend display
  async getVisibleSections() {
    try {
      return await this.contentRepository.getVisibleSections();
    } catch (error) {
      throw new Error(`Service error fetching visible sections: ${error.message}`);
    }
  }

  // Get sections for specific page (frontend helper)
  async getSectionsForPage(sectionTypes = []) {
    try {
      if (!Array.isArray(sectionTypes)) {
        throw new Error('Section types must be an array');
      }

      const filters = { isVisible: true };
      if (sectionTypes.length > 0) {
        filters.sectionType = { $in: sectionTypes };
      }

      const result = await this.contentRepository.getAllSections(filters, {
        sortBy: 'order',
        sortOrder: 'asc',
        limit: 100 // Get all sections for a page
      });

      return result.sections;
    } catch (error) {
      throw new Error(`Service error fetching sections for page: ${error.message}`);
    }
  }

  // Duplicate a section
  async duplicateSection(id, userId) {
    try {
      if (!id) {
        throw new Error('Section ID is required');
      }

      const originalSection = await this.contentRepository.getSectionById(id);
      
      // Create duplicate with modified data
      const duplicateData = {
        sectionType: originalSection.sectionType,
        order: originalSection.order + 1,
        isVisible: false, // Start as hidden
        content: originalSection.content,
        createdBy: userId,
        updatedBy: userId
      };

      return await this.contentRepository.createSection(duplicateData);
    } catch (error) {
      throw new Error(`Service error duplicating section: ${error.message}`);
    }
  }
}

export default ContentService;
