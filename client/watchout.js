// Let's store our game options like n, width, and height in an object. Maybe add some additional options
// like enemies speed and refractory period
// Also add another object called gameData to store high score, current score, and collisions
var gameOptions = {};
var gameData = {};
var user;
var enemies;
var enemiesNodes;
var userNode;

gameOptions.n = 12;
gameOptions.width = 480;
gameOptions.height = 320;  gameOptions.n = 12;
gameOptions.enemySpeed = 1500;
gameOptions.refractoryTime = 500;
gameOptions.scoringSpeed = 100;

var startNewGame = function () {

  gameData.highScore = 0;
  gameData.currentScore = 0;
  gameData.collisions = 0;

  // Create an array of enemies, each of which is an instance of the class Enemy
  // in order to have d3 get the info on the enemies objects and associate with the DOM
  enemies = range(0, gameOptions.n).map(function (el) {
    var x = Math.random() * gameOptions.width;
    var y = Math.random() * gameOptions.height;
    return new Enemy(el, x, y);
  });


  // Add these enemies to the SVG board using d3
  var createCharacters = function(circleType, circleData) {
    d3.select('svg').selectAll('circle.' + circleType).data(circleData)
      .enter()
      .append('circle')
      .attr('class', circleType)
      .attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
      .attr('r', function (d) { return d.r })
      .attr('fill', function (d) { return d.color });
    return d3.select('svg').selectAll('circle.' + circleType);
  };

  user = new User();

  // enemiesNodes and userNode are d3 objects
  enemiesNodes = createCharacters('enemy', enemies);
  userNode = createCharacters('user', [user]);
  userNode.call(drag);
};


/* ----------------------------- THE SUPERCLASS CHARACTER  -----------------------------*/


var Character = function(name, x, y) {
  this.name = name;
  this.x = x;
  this.y = y;
};

// !! What about the prototype??
// it has a prototype that is empty with the exception of the constructor property

// Add the characters in the DOM to the SVG board using d3
var addTag = function(circleType, circleData) {
  d3.select('svg').selectAll('circle.' + circleType).data(circleData)
    .enter()
    .append('circle')
    .attr('class', circleType)
    .attr('cx', function (d) { return d.x })
    .attr('cy', function (d) { return d.y })
    .attr('r', function (d) { return d.r })
    .attr('fill', function (d) { return d.color });
  return d3.select('svg').selectAll('circle.' + circleType); // so that we can store the d3 selector
};

/* ----------------------------- THE ENNEMIES -----------------------------*/


// Create the class Enemy that delegetes to the superclass character
var Enemy = function(name, x, y) {
  Character.call(this, name, x, y);
  this.r = 10;
  this.color = 'green';
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;



// Create the function that generates the movement
var moveEnemies = function() {
  enemies.forEach(function (enemy) {
    enemy.x = Math.random() * (gameOptions.width - 2 * enemy.r) + enemy.r;
    enemy.y = Math.random() * (gameOptions.height - 2 * enemy.r) + enemy.r;
  });
  return enemiesNodes.data(enemies)
    .transition()
    .tween('', function (d) {
      var enemyNode = d3.select(this);
      var collisionFound = false;
      return function () {
        if (!collisionFound && detectCollisions(userNode, enemyNode)){
          collisionFound = true;
          rest();
        }
      };
      // return detectCollisions.bind(null, userNode, enemy);
    })
    .duration(gameOptions.enemySpeed)
    .attr('cx', function (d) { return d.x })
    .attr('cy', function (d) { return d.y });
};

/* ----------------------------- THE USER -----------------------------*/

// Create the class User that delegetes to the superclass character
var User = function() {
  var x = gameOptions.width / 2;
  var y = gameOptions.height / 2;
  Character.call(this, 'user', x, y);
  this.r = 10;
  this.color = 'red';
};

User.prototype = Object.create(Character.prototype);
User.prototype.constructor = User;

/* Make the User move within the board */

var drag = d3.behavior.drag()
  .on('drag', function (d) {
    var userNode = d3.select(this);
    userNode
      .attr('cx', d.x = Math.max(d.r, Math.min(gameOptions.width - d.r, d3.event.x)))
      .attr('cy', d.y = Math.max(d.r, Math.min(gameOptions.height - d.r, d3.event.y)));
    enemiesNodes.each(function (d) {
      var enemyNode = d3.select(this);
      if (detectCollisions(userNode, enemyNode)) {
        rest();
      }
    });
  });

/* ----------------------------- DETECT THE COLLISIONS -----------------------------*/

var detectCollisions = function (user, enemy) {
  var collisionFound = false;
  var userX = +user.attr('cx');
  var userY = +user.attr('cy');
  var enemyX = +enemy.attr('cx');
  var enemyY = +enemy.attr('cy');
  var distance = Math.sqrt(Math.pow((enemyX - userX), 2) + Math.pow((enemyY - userY), 2));
  if (distance < (+user.attr('r') + +enemy.attr('r'))) collisionFound = true;
  return collisionFound;
};

/* ----------------------------- SCORE -----------------------------*/

var scoreCollisions = function() {
  // select all span inside the div that has the class collision
  gameData.collisions++;
  d3.select('div.collisions').select('span').text(gameData.collisions);
  updateCurrentScore();
};

var rest = throttle(scoreCollisions, gameOptions.refractoryTime);

var updateCurrentScore = function() {
  gameData.currentScore = 0;
  d3.select('div.current').select('span').text(gameData.currentScore);
}

var increaseScore = function() {
  gameData.currentScore++;
  d3.select('div.current').select('span').text(gameData.currentScore);
  if (gameData.currentScore > gameData.highScore) {
    gameData.highScore = gameData.currentScore;
    d3.selection('div.high').select('span').text(gameData.highScore);
  }
  return gameData.currentScore;
};

// Dynamically create the board
d3.select('body').append('svg')
  .attr('class', 'gameBoard')
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);
startNewGame();
setInterval(moveEnemies, gameOptions.enemySpeed + 100);
setInterval(increaseScore, gameOptions.scoringSpeed);