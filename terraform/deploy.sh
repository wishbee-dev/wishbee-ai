#!/bin/bash
# ============================================
# Wishbee.ai - Deployment Script
# ============================================

set -e

echo "🐝 Wishbee.ai AWS Deployment Script"
echo "===================================="
echo ""

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform not installed"
    echo "Run: brew install hashicorp/tap/terraform"
    exit 1
fi

echo "✅ Terraform found"

# Check Docker
if ! docker ps &> /dev/null; then
    echo "❌ Docker not running"
    exit 1
fi

echo "✅ Docker running"

# Check image
if ! docker images | grep -q "wishbee-ai"; then
    echo "❌ Docker image 'wishbee-ai:latest' not found"
    exit 1
fi

echo "✅ Docker image found"
echo ""

# Initialize
echo "📦 Initializing Terraform..."
terraform init

echo ""
echo "📋 Planning infrastructure..."
terraform plan -out=tfplan

echo ""
read -p "Apply this plan? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying infrastructure..."
terraform apply tfplan

echo ""
echo "✅ Infrastructure deployed!"
echo ""

# Get outputs
ECR_URL=$(terraform output -raw ecr_repository_url)
CLUSTER=$(terraform output -raw ecs_cluster_name)
SERVICE=$(terraform output -raw ecs_service_name)
REGION=$(terraform output -raw region)

echo "🐳 Pushing Docker image..."
aws ecr get-login-password --region $REGION --profile wishbee | docker login --username AWS --password-stdin $ECR_URL
docker tag wishbee-ai:latest $ECR_URL:latest
docker push $ECR_URL:latest

echo ""
echo "🔄 Updating ECS service..."
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION --profile wishbee --no-cli-pager

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Access your app:"
echo "  Temporary: http://$(terraform output -raw alb_dns_name)"
echo "  Production: https://wishbee.ai (after DNS propagates)"
echo ""
echo "View logs:"
echo "  aws logs tail /ecs/wishbee --follow --region $REGION --profile wishbee"
echo ""
