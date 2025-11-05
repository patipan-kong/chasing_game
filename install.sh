#!/bin/bash

echo "======================================"
echo "Installing Chasing Game Dependencies"
echo "======================================"
echo ""

echo "Installing server dependencies..."
cd server
npm install
cd ..

echo ""
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "To start the game:"
echo "1. Run ./start-server.sh"
echo "2. Run ./start-client.sh (in a new terminal)"
echo "3. Open http://localhost:3000 in your browser"
echo ""
