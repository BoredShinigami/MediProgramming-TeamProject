FrictionFree

Hosted at http://cs270.uk.tempcloudsite.com but may trigger some firewalls.

Created by Mariusz Skoczen, Lorraine Fogarty and Jamie Raleigh.

Music "colors of winter" by lost-radio, used under Creative Commons License



"FrictionFree" is a physics based time-trial racer with the player assuming control of a small circular sprite spawned between two boundary walls.
Our target audiences are students in second level education studying science/physics as well as the casual gamer. This stems from the way in which
the project "Gamifies" Newton's First Law of Motion - "An object at rest stays at rest and an object in motion stays in motion with the same speed 
and in the same direction unless acted upon by an unbalanced force".

The players objective is to navigate the track as fast as possible without coming into contact with either boundary. The sprite is controlled via 
the directional arrows by way of keydown and keyup events. Upon detection of the initial key press a timer is also started allowing the user to 
monitor their progress mid-game. If the sprite were to make contact with a boundary the timer is reset and the sprite respawns back at it's starting
position.

Our game is unique in it's movement system. Unlike most top down racers which move in the direction of the button press at a constant acceleration, in 
FrictionFree the sprites velocity increases incrementally with each button press. The game simulates a  zero gravity environment and so this velocity 
will not decay over time (hence the title, FrictionFree). This means for example, the only way to slow down movement in one direction is to accelerate 
in the opposite and the only way to come to a complete stop is to have equal acceleration in all directions. The start page displays 3 buttons allowing 
the user to choose their difficulty. The difficulty level adjusts the amount by which the acceleration increases with each button press for example,  
Beginner, each press +1, Expert, each press +4.

After successfully navigating the course the sprite crosses the finish line and the players time is displayed in a pop-up. If their time is in the top  
10 results recorded it will appear on the leaderboard beside the track. This leaderboard records the 10 best results obtained on the device in use by  
way of cookies. Each leaderboard is also unique to the difficulty selected. 


