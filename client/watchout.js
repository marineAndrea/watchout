/* ----------------------------- FUNCTION TOOLS -----------------------------*/

var range = function (start, end) {
  var arr = [];
  while(start < end) {
    arr.push(start);
    start++;
  }
  return arr;
};


/* ----------------------------- THE BOARD -----------------------------*/

// Insert dimensions
var width = 360;
var height = 240;
// Dynamically create the board
d3.select('body').append('svg')
  .attr('class', 'gameBoard')
  .attr('width', width)
  .attr('height', height);


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

// Insert the number of ennemies
var n = 1;

// Create the class Enemy that delegetes to the superclass character
var Enemy = function(name, x, y) {
  Character.call(this, name, x, y);
  this.r = 10;
  this.color = 'green';
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

// Create an array of enemies, each of which is an instance of the class Enemy
// in order to have d3 get the info on the enemies objects and associate it with the DOM
var enemies = range(0, n).map(function (n) {
  var x = Math.random() * width;
  var y = Math.random() * height;
  return new Enemy(n, x, y);
});

// EnemiesNodes are d3 objects
var enemiesNodes = addTag('enemy', enemies);

// Create the function that generates the movement of the enemies
var moveEnemies = function() {
  enemies.forEach(function (enemy) {
    enemy.x = Math.random() * width;
    enemy.y = Math.random() * height;
  });
  return enemiesNodes.data(enemies)
    .transition()
    .duration(900)
    .attr('cx', function (d) { return d.x })
    .attr('cy', function (d) { return d.y });
};

// Use setTimeOut to move the enemies
setInterval(moveEnemies, 1000);

/* ----------------------------- THE USER -----------------------------*/

// Create the class User that delegetes to the superclass character
var User = function() {
  var x = width / 2;
  var y = height / 2;
  Character.call(this, 'user', x, y);
  this.r = 10;
  this.color = 'red';
};
User.prototype = Object.create(Character.prototype);
User.prototype.constructor = User;

var user = new User();

// UserNode is a d3 object
var userNode = addTag('user', [user]);


/* Make the User move within the board */

var defineEdges = function (d, userTag, direction) {
  var attribute = 'c' + direction;
  var location = d[direction];
  var lowerBound = d.r;
  var upperBound;
  if (direction === 'x') {
    upperBound = width - d.r;
  } else if (direction === 'y') {
    upperBound = height - d.r;
  }
  if (location > upperBound) {
    userTag.attr(attribute, upperBound);
  } else if (location < lowerBound) {
    userTag.attr(attribute, lowerBound);
  } else {
    userTag.attr(attribute, location);
  }
};

var drag = d3.behavior.drag()
  .on('drag', function (d) {
    /* Right now, we have an issue when the mouse goes off the edge while dragging,
    and unclicks. That sets d.x/d.y to a value outside the bounds of the board.
    On the next click, the dot doesn't follow the cursor exactly. It's offset. Need 
    to fix. */
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    var userTag = d3.select(this);
    defineEdges(d, userTag, 'x');
    defineEdges(d, userTag, 'y');
  });
userNode.call(drag);

/* ----------------------------- DETECT THE COLLISIONS -----------------------------*/

var detectCollisions = function () {
  // iterate across all the enemies dots
  var userX = userNode.attr('cx');
  var userY = userNode.attr('cy');
  var collisionFound = false;
  enemiesNodes.each(function (enemy) {
    // debugger;
    var enemyX = enemy.x;
    var enemyY = enemy.y;
    var distance = Math.sqrt(Math.pow((enemyX - userX), 2) + Math.pow((enemyY - userY), 2));
    if (distance < (+userNode.attr('r') + enemy.r)) console.log('bam!');
  });
    // check to see if any of their location is within a certain distance of the user
    // if so alert "bam!!!"
};

setInterval(detectCollisions, 100);