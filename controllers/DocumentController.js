import DocumentType from "../models/DocumentModel.js";

// --- Create New Document Type ---
export const createDocumentType = async (req, res) => {
  try {
    const { documentName, documentCategory, bankId } = req.body;

    // Check if this document name already exists for this specific bank
    const existingDoc = await DocumentType.findOne({ documentName, bankId });
    if (existingDoc) {
      return res.status(400).json({ 
        message: "This document type already exists for this bank." 
      });
    }

    const newDocType = new DocumentType({
      documentName,
      documentCategory,
      bankId
    });

    await newDocType.save();
    res.status(201).json({ message: "Document type added successfully", document: newDocType });
  } catch (error) {
    res.status(500).json({ message: "Error creating document type", error: error.message });
  }
};

// --- Get All Document Types for a Particular Bank ---
export const getDocumentsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;

    // We filter by bankId and sort them by category for a cleaner UI
    const documents = await DocumentType.find({ bankId }).sort({ documentCategory: 1 });

    res.status(200).json({
      count: documents.length,
      documents
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
};

// --- Edit / Update Document Type ---
export const updateDocumentType = async (req, res) => {
  try {
    const { documentName, documentCategory } = req.body;

    const updatedDoc = await DocumentType.findByIdAndUpdate(
      req.params.id,
      { documentName, documentCategory },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Document type not found" });
    }

    res.status(200).json({ message: "Document updated successfully", document: updatedDoc });
  } catch (error) {
    res.status(500).json({ message: "Error updating document type", error: error.message });
  }
};

// --- Delete Document Type ---
export const deleteDocumentType = async (req, res) => {
  try {
    const document = await DocumentType.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document type not found" });
    }

    res.status(200).json({ message: "Document type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};