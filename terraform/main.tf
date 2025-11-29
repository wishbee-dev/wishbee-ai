# ============================================
# Wishbee.ai - AWS Infrastructure (Terraform)
# ============================================

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
  
  default_tags {
    tags = {
      Project     = "Wishbee"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Generate random password for database (exclude problematic chars)
resource "random_password" "db_password" {
  length  = 32
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Generate random secrets
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "nextauth_secret" {
  length  = 64
  special = false
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local variables
locals {
  account_id = data.aws_caller_identity.current.account_id
  azs        = slice(data.aws_availability_zones.available.names, 0, 3)
  
  container_name = "wishbee-container"
  container_port = 3000
  
  tags = {
    Project     = "Wishbee"
    Environment = var.environment
  }
}
