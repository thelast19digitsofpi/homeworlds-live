# homeworlds-live

This is going to be a real-time web implementation of the two-player strategy board game (Binary) [Homeworlds](https://www.looneylabs.com/games/homeworlds), published by Looney Labs. I am not affiliated with them (but I do like their games; you should check them out).

It is still in progress. Actually, assuming I did not break anything, you can start and play games and it declares a winner, but it does not store anything or have a tutorial. I just resisted putting it on GitHub because I wanted to provide proper attribution for the game (and because I was unsure about licensing).

 

### Star map implementation
Should there be need for it, here is how I organized the star map (arrangement of pieces):
- A piece's "serial number" is its color and size (e.g. g3) followed by a letter (A, B, or C). Example: `r1B`, `y3A`.
- The map itself is an object with each possible "serial number" as a key:
	- A value of `null` means the piece is in the stash.
	- Otherwise, the value is an object `{at: Number, owner: String}` for ships (`owner` is `null` for stars).
	- Systems are simply referred to by an incrementing number (the homeworlds are 1 and 2, the first discovered system is 3, etc).
- Homeworld data is a separate object: `{playerName: systemNumber}`.

### Licensing
Before anyone runs off with this, I want to ask Looney Labs exactly what their stance is on projects like this. I did ask a while back and someone said it would be okay to make something like this but then I realized open source licenses are tricky... and I'm just a bit nervous because I don't know that much about copyright stuff.

That being said, I did formerly state that this **implementation** of the game of Homeworlds was licensed under GPL 3.0.
