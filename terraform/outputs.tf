# ============================================
# Wishbee.ai - Terraform Outputs
# ============================================

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = aws_ecr_repository.main.repository_url
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.main.dns_name
}

output "domain_url" {
  description = "Domain URL"
  value       = "https://${var.domain_name}"
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS Service Name"
  value       = aws_ecs_service.main.name
}

output "database_url" {
  description = "Database Connection URL"
  value       = "postgresql://postgres:${random_password.db_password.result}@${aws_rds_cluster.aurora.endpoint}:5432/wishbee"
  sensitive   = true
}

output "region" {
  description = "AWS Region"
  value       = var.aws_region
}
