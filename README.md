# homeworlds-live

This is a real-time web implementation of the two-player strategy board game (Binary) [Homeworlds](https://www.looneylabs.com/games/homeworlds).

Currently, you can play against others but the user interface is not great. The game does not ask you to confirm upon doing certain Bad Things. 

## Running

After downloading the repository, `cd` into the main directory. You will need to create a self-signed SSL certificate and save the files as `key.pem` and `cert.pem`.

You might have to do some other stuff to get it to work. Right now I use Babel 

You can then use `make run` to start the server. If you do not have `make` installed, then just run `node main.js`.


