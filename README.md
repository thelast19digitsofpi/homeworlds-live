# homeworlds-live

This is going to be a real-time web implementation of the two-player strategy board game (Binary) [Homeworlds](https://www.looneylabs.com/games/homeworlds), published by Looney Labs. I am not affiliated with them (but I do like their games; you should perhaps check them out).

It is still in progress. Actually, assuming I did not break anything, you can start and play games and it declares a winner, but it does not have a tutorial. I just resisted putting it on GitHub because I wanted to provide proper attribution for the game (and because I was unsure about licensing).

### Running

Requires Node.js version 12 or higher.

To run this locally you need a self-signed certificate which can be generated if you have **OpenSSL**. You need to be in the main directory (the one with the `makefile` and `package.json`). [Here's how](https://stackoverflow.com/a/10176685). 

After that, if you plan to make changes to client-side code, you need to run `npm run watch-dev` to start the automatic build process. Whenever you make changes to client-side code, it will automatically recompile. (This uses a bit of CPU so you might want to ^C it when you take a break.)

Otherwise, run `npm run start-dev` to launch the server. Then navigate to `https://localhost:8443` and begin.

For production mode (i.e. before committing), make sure to do `npm run build` to make optimized versions of the scripts. This takes a bit longer.


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
