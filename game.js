/**
 * Game class Esmerelda
 * 
 * 
 */
class Game
{
    #sMap = "";
    #arrMapLines = [];
    #objDivViewport = null;
    #objDivMessageBox = null;
    #iPlayerPositionX = 0; //top-left of screen = 0,0
    #iPlayerPositionY = 0; //top-left of screen = 0,0
    #iPlayerPositionXPrevious = 0; //top-left of screen = 0,0
    #iPlayerPositionYPrevious = 0; //top-left of screen = 0,0   
    #iPlayerStepsTaken = 0;
    #iPlayerHitHead = 0;
    #bPlayerFoundTreasure = false;
    #bGameOver = false;

    constructor()
    {
        this.#loadMap();
        this.#objDivViewport = document.querySelector("#canvas");
        this.#objDivMessageBox = document.querySelector("#message");
        this.#addEventListeners();
        this.resetGame();
    }

    resetGame()
    {
        this.#iPlayerPositionX = 0; //top-left of screen = 0,0
        this.#iPlayerPositionY = 0; //top-left of screen = 0,0
        this.#iPlayerPositionXPrevious = 0; //top-left of screen = 0,0
        this.#iPlayerPositionYPrevious = 0; //top-left of screen = 0,0   
        this.#iPlayerStepsTaken = 0;
        this.#iPlayerHitHead = 0;
        this.#bPlayerFoundTreasure = false;

        this.#initMap();
    }
    

    /**
     * loads map from external file 
     **/
    #loadMap()
    {
        fetch("map.txt")
        .then((objResponse) => objResponse.text())
        .then((objResponseText) => 
        {
            this.#sMap = objResponseText;
            this.#initMap();
            this.#renderViewPort();
            this.#objDivMessageBox.innerHTML = "Use the cursor keys (keyboard) to control Hero Henk (\"H\" on map).<br>Lets go dude, that broad is very impatient!";
        })
        .catch((error) => 
        {
            console.warn(error);
        });                
    }

    /**
     * initialise map and read position player
     */
    #initMap()
    {
        let iTempXPos = 0;

        //find start position of "H" (player)
        if (this.#sMap !== "")
        {
            
            this.#arrMapLines = this.#sMap.split("\n");
            for (let iLineIndex = 0; iLineIndex < this.#arrMapLines.length; iLineIndex++)
            {
                console.log(this.#arrMapLines[iLineIndex]);
                iTempXPos = this.#arrMapLines[iLineIndex].indexOf("H");
                if (iTempXPos >= 0)
                {
                    this.#iPlayerPositionX = iTempXPos;
                    this.#iPlayerPositionY = iLineIndex;

                    this.#iPlayerPositionXPrevious = this.#iPlayerPositionX;
                    this.#iPlayerPositionYPrevious = this.#iPlayerPositionY;
                }
            }
            console.log("H at: x,y", this.#iPlayerPositionX, this.#iPlayerPositionY);
        }
    }

    /**
     * puts map in <div>
     **/ 
    #renderViewPort()
    {
        this.#objDivViewport.innerHTML = "<pre>" + this.#sMap + "<pre>";
    }

    /**
     * detects collision with game objects
     */
    #detectCollision()
    {
        let sDetectedObject = "";
        let bOutOfBounds = false;

        //detect map out-of-bounds
        if (this.#iPlayerPositionY >= this.#arrMapLines.length)
            bOutOfBounds = true;

        if (!bOutOfBounds)
        {
            if (this.#iPlayerPositionX >= this.#arrMapLines[this.#iPlayerPositionY].length)
                bOutOfBounds = true;
        }

        if (bOutOfBounds)
        {
            this.#setNewPlayerPositionUndo();
            return;
        }

        //detect collision
        sDetectedObject = this.#arrMapLines[this.#iPlayerPositionY].substring(this.#iPlayerPositionX, this.#iPlayerPositionX+1);
        console.log("sDetectedObject", sDetectedObject);

        switch(sDetectedObject)
        {
            case "|":
            case "-":
                this.#iPlayerHitHead++;
                if (this.#iPlayerHitHead >= 113)
                {
                    this.#objDivMessageBox.innerHTML = "You hit your head too many times<br>";
                    this.#playerDead();    
                    break;
                }
                this.#objDivMessageBox.innerHTML = `Auw, that's a wall.<br>You hit your head ${this.#iPlayerHitHead} times`;
                this.#setNewPlayerPositionUndo();
                break;
            case "P":
                this.#objDivMessageBox.innerHTML = "You fell into a pit (P)<br>";
                this.#playerDead();    
                break;                
            case "M":
                this.#objDivMessageBox.innerHTML = "You found a monster and were eaten (M)<br>";
                this.#playerDead();    
                break;                  
            case "T":
                this.#objDivMessageBox.innerHTML = "You found a treasure (T)<br>";
                this.#bPlayerFoundTreasure = true;
                break;                        
            case "S":
                this.#objDivMessageBox.innerHTML = `You reached your broad in ${this.#iPlayerStepsTaken} steps. `;
                if (this.#bPlayerFoundTreasure)
                    this.#objDivMessageBox.innerHTML+= 'You found the treasure<br>'
                else
                    this.#objDivMessageBox.innerHTML+= 'You didnt find the treasure<br>'
                this.#objDivMessageBox.innerHTML+= 'Evil warlord Harry is not mad, but dissapointed. <a href="">reset</a>';
                this.#bGameOver = true;
                break;
            case " ":
                this.#objDivMessageBox.innerHTML = `You took ${this.#iPlayerStepsTaken} steps`;
        }
    }

    #playerDead()
    {
        this.#objDivMessageBox.innerHTML += `You died! <a href="">reset</a>`;
        this.#bGameOver = true;
    }

    #addEventListeners()
    {
        //CLICK: pulldown
        document.addEventListener('keydown', (objEvent) => 
        {

            objEvent.preventDefault();//prevent page scroll

            //prevent holding key down
            if (objEvent.repeat != undefined) 
            {
                if (objEvent.repeat == true)
                    return;
            }


            // console.log(`Key down: ${objEvent.key}`);
            if (objEvent.key == "ArrowUp")
            {
                this.#setNewPlayerPosition(this.#iPlayerPositionX, this.#iPlayerPositionY-1);
                this.#detectCollision();
            }
                
            if (objEvent.key == "ArrowRight")
            {
                this.#setNewPlayerPosition(this.#iPlayerPositionX+1, this.#iPlayerPositionY);
                this.#detectCollision();
            }

            if (objEvent.key == "ArrowDown")
            {
                this.#setNewPlayerPosition(this.#iPlayerPositionX, this.#iPlayerPositionY+1);
                this.#detectCollision();
            }
            
            if (objEvent.key == "ArrowLeft")
            {
                this.#setNewPlayerPosition(this.#iPlayerPositionX-1, this.#iPlayerPositionY);
                this.#detectCollision();
            }

        }); 
    }

    /**
     * set position of player on the map
     * 
     * @param {int} iNewX new x coordinate (topleft is 0,0)
     * @param {int} iNewY new y coordinate (topleft is 0,0)
     */
    #setNewPlayerPosition(iNewX, iNewY)
    {
        if (this.#bGameOver)
            return;

        this.#iPlayerPositionXPrevious = this.#iPlayerPositionX;
        this.#iPlayerPositionYPrevious = this.#iPlayerPositionY;
        this.#iPlayerPositionX = iNewX;
        this.#iPlayerPositionY = iNewY;
        this.#iPlayerStepsTaken++;

        console.log("new position x,y", iNewX, iNewY);
    }

    /**
     * revert player position to previous position
     * (happens on collision detection for example)
     * 
     * @param {int} iNewX new x coordinate (topleft is 0,0)
     * @param {int} iNewY new y coordinate (topleft is 0,0)
     */
    #setNewPlayerPositionUndo()
    {
        this.#iPlayerPositionX = this.#iPlayerPositionXPrevious;
        this.#iPlayerPositionY = this.#iPlayerPositionYPrevious;
        this.#iPlayerStepsTaken--;

        // console.log("undo position x,y", this.#iPlayerPositionX, this.#iPlayerPositionY);
    }    
}


var objGame = new Game();

