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
  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
  }
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# ==========================================
# 2. SECURITY GROUP (Corregido)
# ==========================================
resource "aws_security_group" "sg_manual" {
  # EL CAMBIO ESTÁ AQUÍ 👇 (No puede empezar con sg-)
  name        = "vinculacion-sg-manual-final"
  description = "Permitir trafico para configuracion manual"
  vpc_id      = data.aws_vpc.default.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Gateway
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Microservicios
  ingress {
    from_port   = 3000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Bases de Datos
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 27017
    to_port     = 27017
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
# 3. BALANCEADOR (ALB)
# ==========================================
resource "aws_lb" "alb_manual" {
  name               = "alb-vinculacion-manual"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg_manual.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "tg_manual" {
  name     = "tg-general-manual"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 300
    timeout             = 60
    healthy_threshold   = 2
    unhealthy_threshold = 10
    matcher             = "200-404"
  }
}

resource "aws_lb_listener" "listener_http" {
  load_balancer_arn = aws_lb.alb_manual.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_manual.arn
  }
}

resource "aws_lb_listener" "listener_gateway" {
  load_balancer_arn = aws_lb.alb_manual.arn
  port              = "8080"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_manual.arn
  }
}

# ==========================================
# 4. PLANTILLA DE LANZAMIENTO
# ==========================================
resource "aws_launch_template" "lt_manual" {
  name_prefix   = "template-manual-"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"
  key_name      = "vockey"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.sg_manual.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              dnf update -y
              dnf install -y docker git
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user

              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              dnf install -y docker-buildx-plugin
              EOF
  )
}

# ==========================================
# 5. ASG (2 MÁQUINAS FIJAS)
# ==========================================
resource "aws_autoscaling_group" "asg_manual" {
  desired_capacity    = 2
  max_size            = 2
  min_size            = 2
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.tg_manual.arn]

  health_check_type         = "EC2"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.lt_manual.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "Servidor-Manual-Proyecto"
    propagate_at_launch = true
  }
}

# ==========================================
# 6. OUTPUTS
# ==========================================
output "dns_balanceador" {
  value = aws_lb.alb_manual.dns_name
}