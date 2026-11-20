import { claimService } from "../services/claimService.js";
import { verificationService } from "../services/verificationService.js";
import {
  uploadBufferToCloudinary,
  isValidImageSignature,
  deleteFromCloudinary,
} from "../services/cloudinaryService.js";

/**
 * Submit an Election Claim
 * POST /api/claims
 */
export async function submitClaim(req, res, next) {
  try {
    const { claimText, sourceUrl, language, context, categoryTags, imageProofs } = req.body;
    const userId = req.user ? req.user._id : null;
    const isPublic =
      req.body.isPublic === true &&
      req.user &&
      (req.user.role === "admin" || req.user.role === "reviewer");

    const claim = await claimService.submitClaim({
      claimText,
      sourceUrl,
      language,
      context,
      userId,
      categoryTags,
      isPublic,
      imageProofs,
    });

    // Automatically run verification pipeline synchronously to comply with Vercel serverless lifecycle,
    // avoiding unawaited background promises that freeze upon response termination.
    const autoVerify = req.query.autoVerify !== "false" && req.body.autoVerify !== false;
    let verificationResult = null;

    if (autoVerify) {
      try {
        // Enforce a 12-second serverless timeout guard so slow network searches do not block HTTP response
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Verification pipeline timed out")), 12000)
        );

        verificationResult = await Promise.race([
          verificationService.runVerificationPipeline(claim._id),
          timeoutPromise,
        ]);
      } catch (pipelineErr) {
        // Log notice; the claim is already persisted safely in MongoDB with status UNDER_REVIEW
        console.warn(
          `[Verification Notice] Automated verification deferred for claim ${claim._id}:`,
          pipelineErr.message
        );
      }
    }

    const responseClaim = verificationResult ? verificationResult.claim : claim;

    res.status(201).json({
      success: true,
      message: verificationResult
        ? "Claim submitted and verified successfully."
        : "Claim submitted successfully. Verification is in progress.",
      data: {
        claim: responseClaim,
        report: verificationResult ? verificationResult.report : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List Claims with Search, Filtering & Pagination
 * GET /api/claims
 */
export async function getClaims(req, res, next) {
  try {
    const result = await claimService.getClaims(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Aggregate Claim Metrics
 * GET /api/claims/stats
 */
export async function getClaimStats(req, res, next) {
  try {
    const scope = req.query.scope || (req.query.mine === "true" ? "user" : "platform");
    const stats = await claimService.getClaimStats(req.user, scope);
    const userStats = req.user ? await claimService.getClaimStats(req.user, "user") : null;

    res.status(200).json({
      success: true,
      data: {
        stats,
        userStats,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Claim Details by ID (enforces visibility & ownership)
 * GET /api/claims/:id
 */
export async function getClaimById(req, res, next) {
  try {
    const claim = await claimService.getClaimById(req.params.id, req.user);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: "Claim not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Claim Details (owner or admin only)
 * PUT /api/claims/:id
 */
export async function updateClaim(req, res, next) {
  try {
    const claim = await claimService.updateClaim(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "Claim updated successfully.",
      data: { claim },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a Claim (owner or admin only)
 * DELETE /api/claims/:id
 */
export async function deleteClaim(req, res, next) {
  try {
    const result = await claimService.deleteClaim(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload Image Evidence Proofs to Cloudinary
 * POST /api/claims/upload-evidence
 */
export async function uploadEvidenceImages(req, res, next) {
  try {
    const rawFiles = req.files;
    const files = Array.isArray(rawFiles)
      ? rawFiles
      : rawFiles
      ? [...(rawFiles.images || []), ...(rawFiles.evidence || [])]
      : [];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No image files provided for upload.",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 image proof files allowed per submission.",
      });
    }

    // Validate each file signature / magic bytes and size
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} exceeds the 5 MB maximum size limit.`,
        });
      }

      const validSignature = isValidImageSignature(file.buffer, file.mimetype);
      if (!validSignature) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} does not match an allowed image signature (JPG, PNG, WEBP).`,
        });
      }
    }

    const uploadedImages = [];
    try {
      for (const file of files) {
        const uploadResult = await uploadBufferToCloudinary(file.buffer, {
          original_filename: file.originalname,
        });

        uploadedImages.push({
          url: uploadResult.url,
          secureUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          originalName: file.originalname,
          createdAt: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Evidence images uploaded successfully to Cloudinary.",
        data: {
          images: uploadedImages,
        },
      });
    } catch (uploadError) {
      // Roll back any images uploaded in this batch to prevent orphaned files
      for (const img of uploadedImages) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId).catch(() => {});
        }
      }
      throw uploadError;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an Image Evidence Proof from a Claim
 * DELETE /api/claims/:id/evidence/:publicId(*)
 */
export async function deleteEvidenceImage(req, res, next) {
  try {
    const { id, publicId } = req.params;
    const effectivePublicId = publicId || req.body.publicId || req.query.publicId;

    if (!effectivePublicId) {
      return res.status(400).json({
        success: false,
        error: "Cloudinary publicId parameter is required.",
      });
    }

    const result = await claimService.deleteEvidenceImage(id, effectivePublicId, req.user);
    res.status(200).json({
      success: true,
      message: "Evidence image removed successfully.",
      data: result.claim,
    });
  } catch (error) {
    next(error);
  }
}
