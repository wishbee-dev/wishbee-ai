# ============================================
# Wishbee.ai - Secrets Manager
# ============================================

# Database URL Secret
resource "aws_secretsmanager_secret" "database_url" {
  name = "${var.project_name}/database-url"
  
  tags = merge(local.tags, {
    Name = "${var.project_name}-database-url"
  })
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://postgres:${random_password.db_password.result}@${aws_rds_cluster.aurora.endpoint}:5432/wishbee"
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${var.project_name}/jwt-secret"
  
  tags = merge(local.tags, {
    Name = "${var.project_name}-jwt-secret"
  })
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# NextAuth Secret
resource "aws_secretsmanager_secret" "nextauth_secret" {
  name = "${var.project_name}/nextauth-secret"
  
  tags = merge(local.tags, {
    Name = "${var.project_name}-nextauth-secret"
  })
}

resource "aws_secretsmanager_secret_version" "nextauth_secret" {
  secret_id     = aws_secretsmanager_secret.nextauth_secret.id
  secret_string = random_password.nextauth_secret.result
}

# Anthropic API Key
resource "aws_secretsmanager_secret" "anthropic_api_key" {
  name = "${var.project_name}/anthropic-api-key"
  
  tags = merge(local.tags, {
    Name = "${var.project_name}-anthropic-api-key"
  })
}

resource "aws_secretsmanager_secret_version" "anthropic_api_key" {
  secret_id     = aws_secretsmanager_secret.anthropic_api_key.id
  secret_string = var.anthropic_api_key != "" ? var.anthropic_api_key : "placeholder"
}

# OpenAI API Key
resource "aws_secretsmanager_secret" "openai_api_key" {
  name = "${var.project_name}/openai-api-key"
  
  tags = merge(local.tags, {
    Name = "${var.project_name}-openai-api-key"
  })
}

resource "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = var.openai_api_key != "" ? var.openai_api_key : "placeholder"
}

# IAM Policy for ECS to read secrets
resource "aws_iam_policy" "secrets_access" {
  name = "${var.project_name}-secrets-access"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = [
        aws_secretsmanager_secret.database_url.arn,
        aws_secretsmanager_secret.jwt_secret.arn,
        aws_secretsmanager_secret.nextauth_secret.arn,
        aws_secretsmanager_secret.anthropic_api_key.arn,
        aws_secretsmanager_secret.openai_api_key.arn
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_secrets" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = aws_iam_policy.secrets_access.arn
}
