// <svg class = "gameboard" width="360px" height="240px"></svg>

// start slingin' some d3 here.
// define the number of enemies, n
var n = 12;
var width = 360;
var height = 240;

// Dynamically create the board
d3.select('body').append('svg')
  .attr('class', 'gameBoard')
  .attr('width', width)
  .attr('height', height);


var range = function (start, end) {
  var arr = [];
  while(start < end) {
    arr.push(start);
    start++;
  }
  return arr;
};

// define super class
var Character = function(name, x, y) {
  this.name = name;
  this.x = x;
  this.y = y;
};

// define Enemy class with parameters id, xcoord, ycoord
var Enemy = function(name, x, y) {
  Character.call(this, name, x, y);
  this.r = 10;
  this.color = 'green';
};

Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

// create a User class
var User = function() {
  var x = width / 2;
  var y = height / 2;
  Character.call(this, 'user', x, y);
  this.r = 10;
  this.color = 'red';
};

User.prototype = Object.create(Character.prototype);
User.prototype.constructor = User;


// Create an array of enemies, each of which is an instance of the class Enemy
var enemies = range(0, n).map(function (n) {
  var x = Math.random() * width;
  var y = Math.random() * height;
  return new Enemy(n, x, y);
});

// Add these enemies to the SVG board using d3
var addTag = function(circleType, circleData) {
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

var user = new User();
var enemiesNodes = addTag('enemy', enemies);
var userNode = addTag('user', [user]);

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

// Create the function that generates the movement
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

// Use setTimeOut that takes a function as argument

setInterval(moveEnemies, 1000);

// Create function to move user
var moveUser = function(){

};

// Add mouseDown event handling to the userNode