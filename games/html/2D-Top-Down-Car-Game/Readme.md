​1. The Custom Physics Engine (Vector Math)
Unlike simple arcade games where pressing "Up" just moves the car up the screen, this simulator calculates real-world physics using trigonometry (Sine and Cosine) to separate where the car is pointing from where the car is actually moving.

Acceleration & Momentum: When you press the gas, the engine applies force in the direction the car is facing. However, because the car has simulated weight and momentum, turning the steering wheel doesn't instantly change the car's direction of travel.
The "Drift" Mechanic (Sideways Slip): The engine mathematically projects the car's total velocity into two components: Forward Speed and Sideways Speed.
Adjustable Tire Grip: The simulator features a dynamic friction algorithm. If the "Tire Grip" setting is high, the engine aggressively cancels out sideways momentum, making the car drive like it's on rails. If the grip is lowered, the sideways momentum is allowed to persist, resulting in smooth, continuous drifting.

2. The Procedural Audio Gearbox
This is one of the most advanced features of the project. Instead of playing a simple, repetitive sound clip, the game uses the browser's Web Audio API to simulate a real combustion engine.

Steady-State Looping: The game pre-loads a perfectly seamless audio file of an engine holding a constant RPM.
Virtual Gears: The code features a procedural gearbox programmed with specific shift points (40, 90, 150, 210, and 280 km/h).
Dynamic Pitch & Volume: As the car accelerates, the JavaScript dynamically calculates the exact percentage of the current "gear" the car is in and multiplies the playbackRate (pitch) of the audio in real-time. When the car hits a shift point, the pitch instantly drops, perfectly mimicking a real transmission shifting gears.
Throttle Response: The engine immediately reacts to the player pressing the "W" key by slightly spiking the volume and pitch, simulating a throttle blip before the car even starts moving.

3. Real-Time Telemetry and Visuals
The game doubles as an educational tool for understanding physics vectors, rendered flawlessly on an HTML5 <canvas>.

The Vector Arrows: * Blue Arrow: Shows the car's forward-facing direction.
Red Arrow: Shows the actual velocity and momentum of the vehicle.
Green Arrow: Shows the exact amount of sideways slip (drifting force) acting on the tires.
Skid Marks: The game calculates a "Slip Ratio." If the mathematical difference between the car's forward speed and sideways speed exceeds a certain threshold (meaning the tires are losing traction), the rendering engine draws semi-transparent skid marks onto the pavement.
The HUD: A sleek, monospace heads-up display in the top right corner tracks your Speed, Slip (in pixels per second), and your current Grip Status.

4. Responsive "Glassmorphism" UI & Controls
The outer shell of the game is designed to look like a modern web application, completely overriding default browser styles.

Cross-Platform Controls: The game detects what device the player is using. On a PC, it listens for WASD or Arrow Keys. On a touchscreen device, it dynamically injects a custom-built, multi-touch D-Pad into the bottom corners of the screen.
Interactive Settings: Players can click the Settings menu to open a blurred, glass-like dropdown panel where they can manually tweak the Engine Power (up to 3500 for supercar speeds), adjust the Tire Grip, or toggle the SFX on and off.
Developer Credits: A neat, animated modal gives credit to the developer, @shodan_dev, complete with direct links to your GitHub and YouTube channels.
