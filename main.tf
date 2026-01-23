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
# 2. SECURITY GROUP (Instancia EC2)
# ==========================================
resource "aws_security_group" "instancia_sg" {
  name        = "vinculacion-instancia-sg-final"
  description = "SG para el servidor Docker"
  vpc_id      = data.aws_vpc.default.id

  # Permitir todo el tráfico interno (desde el balanceador)
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }

  # SSH
  ingress { from_port = 22; to_port = 22; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  # Permitir tráfico directo a los puertos de microservicios (3000-3010)
  ingress {
    from_port   = 3000
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Puertos principales
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }     # Frontend
  ingress { from_port = 8080; to_port = 8080; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Gateway
  ingress { from_port = 5678; to_port = 5678; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # n8n

  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# ==========================================
# 3. SECURITY GROUP (Load Balancer)
# ==========================================
resource "aws_security_group" "alb_sg" {
  name        = "vinculacion-alb-sg-final"
  description = "SG para el Load Balancer expuesto"
  vpc_id      = data.aws_vpc.default.id

  # Reglas Clave
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 8080; to_port = 8080; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 5678; to_port = 5678; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }

  # Reglas para TODOS los Microservicios
  ingress { from_port = 3000; to_port = 3000; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Auth
  ingress { from_port = 3001; to_port = 3001; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Projects
  ingress { from_port = 3002; to_port = 3002; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Enrollment
  ingress { from_port = 3003; to_port = 3003; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Reporting
  ingress { from_port = 3005; to_port = 3005; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Audit
  ingress { from_port = 3006; to_port = 3006; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Storage
  ingress { from_port = 3007; to_port = 3007; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Location
  ingress { from_port = 3008; to_port = 3008; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] } # Validation

  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# ==========================================
# 4. TARGET GROUPS (Uno por microservicio)
# ==========================================

# Configuración base para Health Checks (Reutilizable mentalmente)
# Path "/" o "/api/health"

resource "aws_lb_target_group" "tg_frontend" {
  name = "tg-front"
  port = 80; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200" }
}

resource "aws_lb_target_group" "tg_gateway" {
  name = "tg-gateway"
  port = 8080; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/api/health"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_n8n" {
  name = "tg-n8n"
  port = 5678; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/healthz"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200" }
}

# --- Microservicios Adicionales ---

resource "aws_lb_target_group" "tg_auth" {
  name = "tg-auth"
  port = 3000; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/api/auth"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_projects" {
  name = "tg-projects"
  port = 3001; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_enrollment" {
  name = "tg-enrollment"
  port = 3002; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_reporting" {
  name = "tg-reporting"
  port = 3003; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_audit" {
  name = "tg-audit"
  port = 3005; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_storage" {
  name = "tg-storage"
  port = 3006; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_location" {
  name = "tg-location"
  port = 3007; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}

resource "aws_lb_target_group" "tg_validation" {
  name = "tg-validation"
  port = 3008; protocol = "HTTP"; vpc_id = data.aws_vpc.default.id
  health_check { path = "/"; interval = 60; timeout = 30; healthy_threshold = 2; unhealthy_threshold = 10; matcher = "200,404" }
}


# ==========================================
# 5. LOAD BALANCER & LISTENERS
# ==========================================
resource "aws_lb" "mi_alb" {
  name               = "vinculacion-alb-final"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# Listeners Principales
resource "aws_lb_listener" "l_front" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "80"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_frontend.arn }
}
resource "aws_lb_listener" "l_gateway" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "8080"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_gateway.arn }
}
resource "aws_lb_listener" "l_n8n" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "5678"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_n8n.arn }
}

# Listeners Microservicios (Direct Access)
resource "aws_lb_listener" "l_auth" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3000"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_auth.arn }
}
resource "aws_lb_listener" "l_projects" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3001"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_projects.arn }
}
resource "aws_lb_listener" "l_enrollment" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3002"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_enrollment.arn }
}
resource "aws_lb_listener" "l_reporting" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3003"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_reporting.arn }
}
resource "aws_lb_listener" "l_audit" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3005"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_audit.arn }
}
resource "aws_lb_listener" "l_storage" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3006"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_storage.arn }
}
resource "aws_lb_listener" "l_location" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3007"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_location.arn }
}
resource "aws_lb_listener" "l_validation" {
  load_balancer_arn = aws_lb.mi_alb.arn; port = "3008"; protocol = "HTTP"
  default_action { type = "forward"; target_group_arn = aws_lb_target_group.tg_validation.arn }
}

# ==========================================
# 6. LAUNCH TEMPLATE
# ==========================================
resource "aws_launch_template" "app_server" {
  name_prefix   = "template-final-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  key_name      = "vockey" # LLAVE DE ACADEMY

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
              # 👇 REEMPLAZA CON TU REPO
              git clone https://github.com/Johnale22/ProyectoFinalDistribuida.git app
              cd app
              
              PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
              echo "N8N_WEBHOOK_URL=http://$PUBLIC_IP:5678/webhook/email" > .env
              
              docker compose -f docker-compose.prod.yml up -d
              EOF
  )
}

# ==========================================
# 7. AUTO SCALING GROUP (ASG)
# ==========================================
resource "aws_autoscaling_group" "mi_asg" {
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  
  # Conectamos TODOS los Target Groups al ASG
  target_group_arns   = [
    aws_lb_target_group.tg_frontend.arn,
    aws_lb_target_group.tg_gateway.arn,
    aws_lb_target_group.tg_n8n.arn,
    aws_lb_target_group.tg_auth.arn,
    aws_lb_target_group.tg_projects.arn,
    aws_lb_target_group.tg_enrollment.arn,
    aws_lb_target_group.tg_reporting.arn,
    aws_lb_target_group.tg_audit.arn,
    aws_lb_target_group.tg_storage.arn,
    aws_lb_target_group.tg_location.arn,
    aws_lb_target_group.tg_validation.arn
  ]

  health_check_type         = "ELB"
  health_check_grace_period = 900 # 15 Minutos

  launch_template {
    id      = aws_launch_template.app_server.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "Cluster-Completo-Final"
    propagate_at_launch = true
  }
}

# ==========================================
# 8. OUTPUTS
# ==========================================
output "url_alb_base" {
  value = "http://${aws_lb.mi_alb.dns_name}"
}