# Message Board Lecture

This is the code from a series of lectures in which we will be creating a message board.

## Prerequisites:  
Install these before moving on:
 - Nodejs
 - Git

## Steps to clone (first time only)
 1. Open your command line:  
    - Windows: Open the start menu, type "cmd.exe", and press enter
    - Mac: press command+space, type "terminal", press enter
 2. run `npm -v` to ensure npm is installed
    - you should see a number
 3. Go to the place you'd like to download this code by using the `cd` command
 4. run `git clone https://github.com/chuckdries/message-board-lecture.git` to download these files
    - a folder called `message-board-lecture` will be created for you
 5. `cd message-board-lecture` to go into this folder
 5. install dependencies by running `npm install`
    - this installs the node modules listed in the `package.json` file.
 6. run the code
    - The "main" script is index.js, you can run it with the command `node index.js`
    - However, we defined a "start" script, so you can also run `npm start`
    - You'll notice that our start script uses nodemon instead of node. Nodemon restarts our code for us, we installed it as a 'development dependency,' which you can see it's part of the 'devDependencies' section of our 'package.json'
    - You may also notice that you cannot run `nodemon` like a command. This is why we need to put it in our start script, because npm installed it into `node_modules`, but node_modules isn't were your computer looks for commands to run, but the start script knows to look there. In computer parlance, we say that nodemon is not in your `path`.

## Steps to run
`npm run start` runs the code. CD into this folder and run it and That's it.  
`npm install --save <name of dependency here>` to install a new dependency.  

## Branches  
I'll be leaving a branch for the state of the code after every lecture. The branch for the code as it was at the end of lecture 1 is called `lecture-1`. I'll go over what branches are and how to use them on wednesday.

Use `git checkout lecture-1` to open the code from lecture 1 (though I haven't actually changed anything meaningful yet).
Use `git checkout master` to come back to the main code.

## Email me if you have any questions:
cpdries@asu.edu

## Office Hours
Friday, October 19 @ 3:00pm on https://twitch.tv/chuckletmilk
