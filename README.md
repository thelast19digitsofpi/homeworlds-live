# homeworlds-live

This is going to be a real-time web implementation of the two-player strategy board game (Binary) [Homeworlds](https://www.looneylabs.com/games/homeworlds), published by Looney Labs. I am not affiliated with them (but I do like their games; you should perhaps check them out).

It is still in progress. Actually, assuming I did not break anything, you can start and play games and it declares a winner, but it does not have a tutorial. I just resisted putting it on GitHub because I wanted to provide proper attribution for the game (and because I was unsure about licensing).

### Star map implementation
Should there be need for it, here is how I organized the star map (arrangement of pieces):
- A piece's "serial number" is its color and size (e.g. g3) followed by a letter (A, B, or C). Example: `r1B`, `y3A`.
- The map itself is an object with each possible "serial number" as a key:
	- A value of `null` means the piece is in the stash.
	- Otherwise, the value is an object `{at: Number, owner: String}` for ships (`owner` is `null` for stars).
	- Systems are simply referred to by an incrementing number (the homeworlds are 1 and 2, the first discovered system is 3, etc).
- Homeworld data is a separate object: `{playerName: systemNumber}`.

### Licensing

_Please note that the following applies to this particular IMPLEMENTATION; I do not own the actual game of Homeworlds_.

Copyright (C) 2020 Croix Gyurek

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>. 
