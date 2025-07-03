#!/bin/bash

# Stop DilSeDaan Platform Script
echo "🛑 Stopping DilSeDaan Platform..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Kill processes by PID if .platform_pids exists
if [ -f ".platform_pids" ]; then
    source .platform_pids
    
    if [ ! -z "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        print_success "Stopped frontend server (PID: $FRONTEND_PID)"
    fi
    
    if [ ! -z "$BACKEND_PID" ] && ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        print_success "Stopped backend server (PID: $BACKEND_PID)"
    fi
    
    if [ ! -z "$HARDHAT_PID" ] && ps -p $HARDHAT_PID > /dev/null 2>&1; then
        kill $HARDHAT_PID
        print_success "Stopped Hardhat network (PID: $HARDHAT_PID)"
    fi
    
    rm .platform_pids
fi

# Kill any remaining processes
print_info "Cleaning up any remaining processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "hardhat.*node" 2>/dev/null || true

# Kill processes on specific ports
lsof -ti:3000,3001,5000,5001,8545 | xargs kill -9 2>/dev/null || true

print_success "All DilSeDaan services stopped"
print_info "Log files preserved: frontend.log, backend.log, hardhat-network.log"
