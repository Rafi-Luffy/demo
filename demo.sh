#!/bin/bash

# DilSeDaan Quick Demo Script
echo "🎉 DilSeDaan Complete Platform Demo"
echo "=================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Starting backend server...${NC}"
cd apps/backend
npm run dev &
BACKEND_PID=$!
cd ../..

sleep 3

echo -e "${BLUE}Starting frontend server...${NC}"
cd apps/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

sleep 5

echo -e "${GREEN}✅ Platform started successfully!${NC}"
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend:  http://localhost:5000/api/health"
echo ""
echo "🎯 Demo Features Available:"
echo "   • View campaigns and impact stories"
echo "   • Register as volunteer"
echo "   • Create new campaigns"
echo "   • Make demo donations"
echo "   • Admin dashboard"
echo "   • Transparency tracking"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Save PIDs for cleanup
echo "FRONTEND_PID=$FRONTEND_PID" > .demo_pids
echo "BACKEND_PID=$BACKEND_PID" >> .demo_pids

# Wait for interrupt
trap 'echo ""; echo "Stopping demo..."; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; rm .demo_pids; exit 0' INT

while true; do
    sleep 1
done
