# Game Configuration Guide

## game_data.json

This file controls the core game timing settings:

### Parameters

| Parameter | Description | Default Value | Unit |
|-----------|-------------|---------------|------|
| `lobbyWaitingTime` | Time to wait in lobby for players before auto-starting | 30 | seconds |
| `gamePlayTime` | Duration of each game session | 180 | seconds |

### How to Modify

1. Open `server/game_data.json`
2. Edit the values:
   ```json
   {
       "lobbyWaitingTime": 30,    // Change this number
       "gamePlayTime": 180         // Change this number
   }
   ```
3. Restart the server for changes to take effect

### Examples

**Quick Games (1 minute):**
```json
{
    "lobbyWaitingTime": 15,
    "gamePlayTime": 60
}
```

**Long Games (5 minutes):**
```json
{
    "lobbyWaitingTime": 45,
    "gamePlayTime": 300
}
```

**Tournament Mode (2 minutes, instant start):**
```json
{
    "lobbyWaitingTime": 10,
    "gamePlayTime": 120
}
```

### Notes

- **lobbyWaitingTime**: 
  - Minimum recommended: 10 seconds
  - Maximum recommended: 120 seconds
  - If 2+ players join, waiting time automatically reduces to 10 seconds
  
- **gamePlayTime**: 
  - Minimum recommended: 30 seconds
  - Maximum recommended: 600 seconds (10 minutes)
  - Affects game balance - shorter times favor the Giant, longer times favor Players

### Impact on Gameplay

- **Shorter waiting time**: Games start faster but with fewer real players (more AI)
- **Longer waiting time**: More chance for real players to join
- **Shorter game time**: More intense, favors the Giant (chaser)
- **Longer game time**: More strategic, favors the Players (runners)
