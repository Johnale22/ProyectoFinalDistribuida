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
# 1. DATA SOURCES (Amazon Linux)
# ==========================================
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
  }
}

# Buscamos Amazon Linux 2023
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# ==========================================
# 2. SECURITY GROUPS (Expandidos)
# ==========================================

# SG para la Instancia (Tráfico interno + SSH)
resource "aws_security_group" "instancia_sg" {
  name        = "vinculacion-instancia-sg-linux-final"
  description = "SG para Amazon Linux"
  vpc_id      = data.aws_vpc.default.id

  # Tráfico interno VPC
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Rango de Microservicios (3000-3010)
  ingress {
    from_port   = 3000
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Puertos principales
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5678
    to_port     = 5678
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG para el Balanceador (Público)
resource "aws_security_group" "alb_sg" {
  name        = "vinculacion-alb-sg-linux-final"
  description = "SG para Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  # Reglas Web
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 5678
    to_port     = 5678
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Microservicios directos (3000-3010)
  ingress {
    from_port   = 3000
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Salida
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 3. TARGET GROUPS (Expandidos)
# ==========================================

# Frontend
resource "aws_lb_target_group" "tg_frontend" {
  name     = "tg-front-al"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/"
    interval = 60
    matcher  = "200"
  }
}

# Gateway
resource "aws_lb_target_group" "tg_gateway" {
  name     = "tg-gateway-al"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/api/health"
    interval = 60
    matcher  = "200,404"
  }
}

# n8n
resource "aws_lb_target_group" "tg_n8n" {
  name     = "tg-n8n-al"
  port     = 5678
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/healthz"
    interval = 60
    matcher  = "200"
  }
}

# Auth
resource "aws_lb_target_group" "tg_auth" {
  name     = "tg-auth-al"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/"
    interval = 60
    matcher  = "200,404"
  }
}

# Projects
resource "aws_lb_target_group" "tg_projects" {
  name     = "tg-projects-al"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/"
    interval = 60
    matcher  = "200,404"
  }
}

# Enrollment
resource "aws_lb_target_group" "tg_enrollment" {
  name     = "tg-enrollment-al"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path     = "/"
    interval = 60
    matcher  = "200,404"
  }
}

# ==========================================
# 4. LOAD BALANCER & LISTENERS (Expandidos)
# ==========================================
resource "aws_lb" "mi_alb" {
  name               = "vinculacion-alb-linux"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Listener 80
resource "aws_lb_listener" "l_front" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_frontend.arn
  }
}

# Listener 8080
resource "aws_lb_listener" "l_gateway" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "8080"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_gateway.arn
  }
}

# Listener 5678
resource "aws_lb_listener" "l_n8n" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "5678"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_n8n.arn
  }
}

# Listener 3000
resource "aws_lb_listener" "l_auth" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3000"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_auth.arn
  }
}

# Listener 3001
resource "aws_lb_listener" "l_projects" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3001"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_projects.arn
  }
}

# Listener 3002
resource "aws_lb_listener" "l_enrollment" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3002"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_enrollment.arn
  }
}

# ==========================================
# 5. LAUNCH TEMPLATE & ASG (Amazon Linux)
# ==========================================
resource "aws_launch_template" "app_server" {
  name_prefix   = "template-linux-final-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.instancia_sg.id]
  }

  # SCRIPT DE INICIO (Optimizado AL2023)
  user_data = base64encode(<<-EOF
              #!/bin/bash
              
              # 1. SWAP
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 2. Instalar Docker y Git (dnf es nativo de AL2023)
              dnf update -y
              dnf install -y docker git
              
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user

              # 3. Instalar Docker Compose Manualmente
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # 4. Desplegar App (en home de ec2-user)
              cd /home/ec2-user
              git clone https://github.com/Johnale22/ProyectoFinalDistribuida.git app
              cd app
              
              # Asegurar permisos
              chown -R ec2-user:ec2-user /home/ec2-user/app
              
              # Obtener IP usando Token IMDSv2 (Obligatorio en AL2023)
              TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
              PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)
              
              echo "N8N_WEBHOOK_URL=http://$PUBLIC_IP:5678/webhook/email" > .env
              
              # 5. Levantar
              /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
              EOF
  )
}

resource "aws_autoscaling_group" "mi_asg" {
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  
  target_group_arns   = [
    aws_lb_target_group.tg_frontend.arn,
    aws_lb_target_group.tg_gateway.arn,
    aws_lb_target_group.tg_n8n.arn,
    aws_lb_target_group.tg_auth.arn,
    aws_lb_target_group.tg_projects.arn,
    aws_lb_target_group.tg_enrollment.arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 900

  launch_template {
    id      = aws_launch_template.app_server.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "Cluster-AmazonLinux-Final"
    propagate_at_launch = true
  }
}

output "url_alb" {
  value = "http://${aws_lb.mi_alb.dns_name}"
}