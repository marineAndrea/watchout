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

// define Enemy class with parameters id, xcoord, ycoord
var Enemy = function(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = 10;
  this.color = 'green';
};

// Create an array of enemies, each of which is an instance of the class Enemy
var enemies = range(0, n).map(function (n) {
  var x = Math.random() * width;
  var y = Math.random() * height;
  return new Enemy(n, x, y);
});

// Add these enemies to the SVG board using d3

d3.select('svg').selectAll('circle').data(enemies)
  .enter()
  .append('circle')
  .attr('cx', function (d) { return d.x })
  .attr('cy', function (d) { return d.y })
  .attr('r', function (d) { return d.r })
  .attr('fill', function (d) { return d.color });
