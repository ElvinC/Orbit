# Orbit
A 2d two body orbital dynamics simulator written in javascript.


It's mostly made for fun, and may contain bugs.

[try it here!](https://elvinc.github.io/Orbit/)

# How to use it:
The "green" object can be controlled by the user using WASD, Z and X, Shift and Ctrl.

WASD: Accelerate in the given direction.

Z: Accelerate in the current moving direction.
X: Decelerate in the current moving direction.

Shift: Increase the thrust/acceleration.
Ctrl: Decrease the thrust/acceleration.

The settings menu can be used to change the gravitational constant, the objects mass, size, and starting parameters.
It includes some "presets". (The size/scale/speed isn't accurate to the real world).


The [en.wikipedia.org/wiki/Hohmann_transfer_orbit](Hohmann transfer orbit) can be used to increase or decrease the size of a circular orbit. The Z and X keys are useful for that.

Notes: The "Thrust" number is technically acceleration when the user is controlling. The unit is unit/s<sup>2</sup>, but should technically be mass * unit / s<sup>2</sup>.
Using "acceleration" might be confusing, so I kept "thrust".
