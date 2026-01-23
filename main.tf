terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ==========================================
# 1. DATOS DE RED Y SISTEMA OPERATIVO
# ==========================================
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Buscamos Ubuntu 22.04 (Mejor compatibilidad con Docker que Amazon Linux)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ==========================================
# 2. SECURITY GROUP (Firewall)
# ==========================================
resource "aws_security_group" "microservicios_sg" {
  name        = "vinculacion-sg-produccion"
  description = "Permitir trafico a todos los microservicios"
  vpc_id      = data.aws_vpc.default.id

  # SSH (Puerto 22)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP Web (Puerto 80)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Gateway (Puerto 8080)
  ingress {
    description = "Gateway"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # n8n (Puerto 5678)
  ingress {
    description = "n8n"
    from_port   = 5678
    to_port     = 5678
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # RabbitMQ Management (Puerto 15672)
  ingress {
    description = "RabbitMQ Admin"
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Rango de Microservicios (3000 a 3010)
  ingress {
    description = "Microservicios Range"
    from_port   = 3000
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida (Egress) - Permitir todo
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 3. SERVIDOR (Launch Template)
# ==========================================
resource "aws_launch_template" "app_server" {
  name_prefix   = "vinculacion-template-"
  image_id      = data.aws_ami.ubuntu.id
  
  # En Academy a veces limitan t3.medium. Si falla, intenta t2.large o t3.small
  instance_type = "t3.medium"
  
  # CLAVE DE AWS ACADEMY (IMPORTANTE)
  key_name = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.microservicios_sg.id]
  }

  # Script de instalación
  user_data = base64encode(<<-EOF
              #!/bin/bash
              # 1. Instalar Docker y Git
              apt-get update
              apt-get install -y docker.io docker-compose-plugin git
              usermod -aG docker ubuntu

              # 2. Clonar Repo
              cd /home/ubuntu
              # 👇 ¡ASEGURATE QUE ESTA URL SEA LA TUYA!
              git clone https://github.com/TU_USUARIO/sistema-vinculacion.git app
              cd app
              
              # 3. Configurar IP Dinámica para n8n
              PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
              echo "N8N_WEBHOOK_URL=http://$PUBLIC_IP:5678/webhook/email" > .env
              
              # 4. Desplegar
              docker compose -f docker-compose.prod.yml up -d
              EOF
  )
}

# ==========================================
# 4. AUTO SCALING GROUP (ASG)
# ==========================================
resource "aws_autoscaling_group" "app_asg" {
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  
  launch_template {
    id      = aws_launch_template.app_server.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "Cluster-Vinculacion-Prod"
    propagate_at_launch = true
  }
}