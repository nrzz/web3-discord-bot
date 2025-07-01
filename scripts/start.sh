#!/bin/bash

# Web3 Discord Bot Startup Script
# This script handles the deployment and startup of the Web3 Discord Bot

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18.0.0 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18.0.0 or higher."
        exit 1
    fi
    
    print_success "Node.js version $NODE_VERSION is compatible"
}

# Check if config file exists
check_config() {
    if [ ! -f "config.env" ]; then
        print_error "config.env file not found. Please create it with your configuration."
        exit 1
    fi
    
    print_success "Configuration file found"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed, skipping..."
    fi
}

# Create logs directory
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        print_success "Logs directory created"
    fi
}

# Deploy commands
deploy_commands() {
    print_status "Deploying Discord commands..."
    node deploy-commands.js
    print_success "Commands deployed successfully"
}

# Start the bot
start_bot() {
    print_status "Starting Web3 Discord Bot..."
    
    # Check if PM2 is available
    if command -v pm2 &> /dev/null; then
        print_status "Using PM2 for process management..."
        
        # Stop existing process if running
        pm2 stop web3-discord-bot 2>/dev/null || true
        pm2 delete web3-discord-bot 2>/dev/null || true
        
        # Start with PM2
        pm2 start ecosystem.config.js
        
        print_success "Bot started with PM2"
        print_status "Use 'pm2 logs web3-discord-bot' to view logs"
        print_status "Use 'pm2 status' to check status"
        print_status "Use 'pm2 stop web3-discord-bot' to stop"
    else
        print_warning "PM2 not found, starting with Node.js directly..."
        print_status "For production, consider installing PM2: npm install -g pm2"
        
        # Start directly with Node.js
        node src/index.js
    fi
}

# Main execution
main() {
    print_status "Starting Web3 Discord Bot deployment..."
    
    check_node
    check_config
    install_dependencies
    create_logs_dir
    deploy_commands
    start_bot
    
    print_success "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_node
        check_config
        print_success "All checks passed!"
        ;;
    "install")
        check_node
        check_config
        install_dependencies
        create_logs_dir
        print_success "Installation completed!"
        ;;
    "deploy")
        check_node
        check_config
        install_dependencies
        create_logs_dir
        deploy_commands
        print_success "Commands deployed!"
        ;;
    "start")
        start_bot
        ;;
    "help"|"-h"|"--help")
        echo "Web3 Discord Bot Startup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     - Check system requirements and configuration"
        echo "  install   - Install dependencies and setup directories"
        echo "  deploy    - Deploy Discord commands"
        echo "  start     - Start the bot"
        echo "  help      - Show this help message"
        echo ""
        echo "If no command is provided, the script will run the full deployment process."
        ;;
    *)
        main
        ;;
esac 