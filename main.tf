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
  owners      = ["099720109477"]
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
# 2. SECURITY GROUPS (Expandidos línea por línea)
# ==========================================

# SG para la Instancia EC2 (Donde vive Docker)
resource "aws_security_group" "instancia_sg" {
  name        = "vinculacion-instancia-sg-final"
  description = "SG para el servidor Docker"
  vpc_id      = data.aws_vpc.default.id

  # Tráfico interno total (para que el ALB hable con la EC2)
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

  # Rango masivo de Microservicios (3000-3010)
  ingress {
    from_port   = 3000
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Puertos Específicos
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

# SG para el Load Balancer (Expuesto a internet)
resource "aws_security_group" "alb_sg" {
  name        = "vinculacion-alb-sg-final"
  description = "SG para el Load Balancer expuesto"
  vpc_id      = data.aws_vpc.default.id

  # Reglas Principales
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

  # Reglas Microservicios Individuales
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3003
    to_port     = 3003
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3005
    to_port     = 3005
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3006
    to_port     = 3006
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3007
    to_port     = 3007
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3008
    to_port     = 3008
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
# 3. TARGET GROUPS (Uno por servicio)
# ==========================================

# Frontend (80)
resource "aws_lb_target_group" "tg_frontend" {
  name     = "tg-front"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200"
  }
}

# Gateway (8080)
resource "aws_lb_target_group" "tg_gateway" {
  name     = "tg-gateway"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/api/health"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# n8n (5678)
resource "aws_lb_target_group" "tg_n8n" {
  name     = "tg-n8n"
  port     = 5678
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/healthz"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200"
  }
}

# Auth (3000)
resource "aws_lb_target_group" "tg_auth" {
  name     = "tg-auth"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Projects (3001)
resource "aws_lb_target_group" "tg_projects" {
  name     = "tg-projects"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Enrollment (3002)
resource "aws_lb_target_group" "tg_enrollment" {
  name     = "tg-enrollment"
  port     = 3002
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Reporting (3003)
resource "aws_lb_target_group" "tg_reporting" {
  name     = "tg-reporting"
  port     = 3003
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Audit (3005)
resource "aws_lb_target_group" "tg_audit" {
  name     = "tg-audit"
  port     = 3005
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Storage (3006)
resource "aws_lb_target_group" "tg_storage" {
  name     = "tg-storage"
  port     = 3006
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Location (3007)
resource "aws_lb_target_group" "tg_location" {
  name     = "tg-location"
  port     = 3007
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# Validation (3008)
resource "aws_lb_target_group" "tg_validation" {
  name     = "tg-validation"
  port     = 3008
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/"
    interval = 60
    timeout = 30
    healthy_threshold = 2
    unhealthy_threshold = 10
    matcher = "200,404"
  }
}

# ==========================================
# 4. LOAD BALANCER & LISTENERS
# ==========================================
resource "aws_lb" "mi_alb" {
  name               = "vinculacion-alb-final"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# --- Listeners (Reglas de Enrutamiento) ---

# Port 80 -> Frontend
resource "aws_lb_listener" "l_front" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_frontend.arn
  }
}

# Port 8080 -> Gateway
resource "aws_lb_listener" "l_gateway" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "8080"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_gateway.arn
  }
}

# Port 5678 -> n8n
resource "aws_lb_listener" "l_n8n" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "5678"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_n8n.arn
  }
}

# Port 3000 -> Auth
resource "aws_lb_listener" "l_auth" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3000"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_auth.arn
  }
}

# Port 3001 -> Projects
resource "aws_lb_listener" "l_projects" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3001"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_projects.arn
  }
}

# Port 3002 -> Enrollment
resource "aws_lb_listener" "l_enrollment" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3002"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_enrollment.arn
  }
}

# Port 3003 -> Reporting
resource "aws_lb_listener" "l_reporting" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3003"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_reporting.arn
  }
}

# Port 3005 -> Audit
resource "aws_lb_listener" "l_audit" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3005"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_audit.arn
  }
}

# Port 3006 -> Storage
resource "aws_lb_listener" "l_storage" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3006"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_storage.arn
  }
}

# Port 3007 -> Location
resource "aws_lb_listener" "l_location" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3007"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_location.arn
  }
}

# Port 3008 -> Validation
resource "aws_lb_listener" "l_validation" {
  load_balancer_arn = aws_lb.mi_alb.arn
  port              = "3008"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_validation.arn
  }
}

# ==========================================
# 5. LAUNCH TEMPLATE & ASG
# ==========================================

resource "aws_launch_template" "app_server" {
  name_prefix   = "template-final-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.instancia_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              sleep 30
              apt-get update
              apt-get install -y docker.io docker-compose-plugin git
              usermod -aG docker ubuntu

              cd /home/ubuntu
              # 👇 USA TU REPOSITORIO
              git clone https://github.com/Johnale22/ProyectoFinalDistribuida.git app
              cd app
              
              PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
              echo "N8N_WEBHOOK_URL=http://$PUBLIC_IP:5678/webhook/email" > .env
              
              docker compose -f docker-compose.prod.yml up -d
              EOF
  )
}

resource "aws_autoscaling_group" "mi_asg" {
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = data.aws_subnets.default.ids
  
  # CONECTAMOS TODOS LOS TARGET GROUPS
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
  health_check_grace_period = 900 # 15 Minutos de espera

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

output "url_alb_base" {
  value = "http://${aws_lb.mi_alb.dns_name}"
}