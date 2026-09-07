# Gridiron Gateway — Google Cloud Storage (GCS) Production Media Infrastructure
# Manages athlete highlight videos, raw game film, Catapult GPS logs, and combine laser telemetry.

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "GCP Project ID for Gridiron Gateway infrastructure."
  default     = "gridiron-gateway-prod"
}

variable "region" {
  type        = string
  description = "Primary GCP region for GCS bucket deployment."
  default     = "us-central1"
}

# Primary GCS Bucket for Athlete Media & Game Film
resource "google_storage_bucket" "media_bucket" {
  name                        = "${var.project_id}-media-vault"
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  cors {
    origin          = ["https://gridiron-gateway.app", "http://localhost:5173"]
    method          = ["GET", "PUT", "POST", "HEAD", "DELETE", "OPTIONS"]
    response_header = ["Content-Type", "x-goog-resumable", "x-goog-meta-athlete-id", "x-goog-meta-coppa-verified"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  versioning {
    enabled = true
  }

  labels = {
    environment = "production"
    platform    = "gridiron-gateway"
    compliance  = "coppa-ncaa-verified"
  }
}

# Service Account for Edge Server V4 Signed URL Generation
resource "google_service_account" "gcs_signer" {
  account_id   = "gg-gcs-signed-url-signer"
  display_name = "Gridiron Gateway GCS Signed URL Signer"
}

# Grant Storage Object Admin role to the Service Account
resource "google_storage_bucket_iam_member" "signer_object_admin" {
  bucket = google_storage_bucket.media_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.gcs_signer.email}"
}

output "media_bucket_name" {
  value       = google_storage_bucket.media_bucket.name
  description = "Created GCS Media Vault Bucket Name."
}

output "signer_service_account_email" {
  value       = google_service_account.gcs_signer.email
  description = "Service Account email responsible for V4 Signed URL generation."
}
