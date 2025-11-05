@echo off
echo ======================================
echo Installing Chasing Game Dependencies
echo ======================================
echo.

echo Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo ======================================
echo Installation Complete!
echo ======================================
echo.
echo To start the game:
echo 1. Run start-server.bat
echo 2. Run start-client.bat (in a new terminal)
echo 3. Open http://localhost:3000 in your browser
echo.
pause
