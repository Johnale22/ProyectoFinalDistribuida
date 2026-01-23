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
# 1. DATA SOURCES
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

# Buscamos Ubuntu 22.04 (El mejor para Docker en Academy)
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
# 2. SECURITY GROUP (Firewall para la Instancia)
# ==========================================
resource "aws_security_group" "instancia_sg" {
  name        = "vinculacion-instancia-sg"
  description = "Security Group para las EC2 internas"
  vpc_id      = data.aws_vpc.default.id

  # Permitir todo el tráfico que venga DENTRO de la VPC (del Balanceador)
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }

  # SSH (Solo para admins)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Permitir tráfico directo a puertos clave (opcional para debug)
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 3. SECURITY GROUP (Para el Balanceador)
# ==========================================
resource "aws_security_group" "alb_sg" {
  name        = "vinculacion-alb-sg"
  description = "Security Group para el Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  # El mundo puede ver: Web (80), Gateway (8080), n8n (5678)
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 8080; to_port = 8080; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 5678; to_port = 5678; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# ==========================================
# 4. TARGET GROUPS (Donde apunta el Balanceador)
# ==========================================

# Grupo 1: Frontend (Puerto 80 en la instancia)
resource "aws_lb_target_group" "tg_frontend" {
  name     = "tg-frontend"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check { path = "/"; matcher = "200"; }
}

# Grupo 2: Gateway (Puerto 8080 en la instancia)
resource "aws_lb_target_group" "tg_gateway" {
  name     = "tg-gateway"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check { path = "/api/health"; matcher = "200,404"; } # Ajusta el path si tienes uno
}

# Grupo 3: n8n (Puerto 5678 en la instancia)
resource "aws_lb_target_group" "tg_n8n" {
  name     = "tg-n8n"
  port     = 5678
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check { path = "/healthz"; matcher = "200"; }
}

# ==========================================
# 5. LOAD BALANCER (ALB)
# ==========================================
resource "aws_lb" "mi_alb" {
  name               = "vinculacion-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Listeners (Reglas de ruteo)
resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_frontend.arn
  }
}

resource "aws_lb_listener" "gateway" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "8080"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_gateway.arn
  }
}

resource "aws_lb_listener" "n8n" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "5678"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_n8n.arn
  }
}

# ==========================================
# 6. LAUNCH TEMPLATE (El Servidor)
# ==========================================
resource "aws_launch_template" "app_server" {
  name_prefix   = "vinculacion-template-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3.medium" # O t2.large si tienes créditos
  key_name      = "vockey"    # LLAVE DE ACADEMY

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.instancia_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose-plugin git
              usermod -aG docker ubuntu

              cd /home/ubuntu
              # 👇 PON TU REPO REAL AQUÍ
              git clone https://github.com/Johnale22/ProyectoFinalDistribuida.git app
              cd app
              
              # Configurar IP para n8n usando el DNS del Balanceador (opcional) o IP pública
              PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
              echo "N8N_WEBHOOK_URL=http://$PUBLIC_IP:5678/webhook/email" > .env
              
              # Desplegar
              docker compose -f docker-compose.prod.yml up -d
              EOF
  )
}

# ==========================================
# 7. AUTO SCALING GROUP (Alta Disponibilidad)
# ==========================================
resource "aws_autoscaling_group" "mi_asg" {
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  
  # Conectamos el ASG a los 3 Target Groups
  target_group_arns   = [
    aws_lb_target_group.tg_frontend.arn,
    aws_lb_target_group.tg_gateway.arn,
    aws_lb_target_group.tg_n8n.arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 300

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

# ==========================================
# 8. OUTPUTS (Lo que verás al final)
# ==========================================
output "url_frontend" {
  value = "http://${aws_lb.mi_alb.dns_name}"
}
output "url_gateway" {
  value = "http://${aws_lb.mi_alb.dns_name}:8080"
}
output "url_n8n" {
  value = "http://${aws_lb.mi_alb.dns_name}:5678"
}