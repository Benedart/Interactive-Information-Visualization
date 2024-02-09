// set our canvas size, unit is pixel
var canvas_width = 1200;
var canvas_height = 600;

var font_type = 'Arial';
var font_height = 14;
var font_color = 'white';

var space_name_line = 10;
var grid_weight = 1;

// set line spacing
var line_spacing = 10;

// 1. set the margins
var right_margin = 50, left_margin = 50;
var top_margin = 20, bottom_margin = 20;

var selectedYear = "2022"; // Default selected year

let flags = {}; // Object to store flag images

// Variable to store the index of the currently hovered flag
let hoveredFlagIndex = -1;

/* preload the data */
function preload() {
  /* read csv file */
  attainment_table = loadTable("data/Procesed Eurostat Dataset.csv", "csv", "header");
  employment_table = loadTable("data/Employment-Processed-Temp.csv", "csv", "header");
  population_table = loadTable("data/Population-Migrant-AllAge-FinalwithNum.csv", "csv", "header");
}

function setup() {
  // put setup code here
  // create a centered canvas
  createCanvas(canvas_width, canvas_height);

  countries = [];
  years = [];
  educational_attainment = {};
  employment_rate = {};
  population = {};

  // get all countries' names
  countries = attainment_table.getColumn("GEO");
  console.log(countries);

  // get all years
  years = attainment_table.columns;
  // remove the first element, which is the name of the country
  years.splice(0, 1);
  // check the years
  console.log(years);

  // create an object to store the educational attainment rate for each year
  for (var i = 0; i < years.length; i++) {
    // get the year
    year = years[i];
    // get the educational attainment rate for each year
    educational_attainment[year] = attainment_table.getColumn(year).map(Number);
    // get the employment rate for each year
    employment_rate[year] = employment_table.getColumn(year).map(Number);
    // get the population for each year
    population[year] = population_table.getColumn(year).map(Number);
  }
  console.log("Educational Attainment: ", educational_attainment);
  console.log("Employment Rate: ", employment_rate);
  console.log("Population: ", population);

  // create the year selector
  createYearSelector(years);

  // Load flag images
  for (let country of countries) {
    flags[country] = loadImage(`data/flags/${country}.png`);
  }

  // set the text type and size
  textFont(font_type);
  textSize(font_height);
}

function draw() {
  background(255);
  drawAxis();
  drawScale();
  drawData(selectedYear);
}

function drawAxis() {
  // Draw horizontal line
  stroke(0);
  line(100, height - 100, width - 100, height - 100);

  // Draw vertical line
  line(100, 100, 100, height - 100);
}

function drawScale() {
  // horizontal scale goes from 0 to 70
  for (let i = 0; i <= 70; i += 10) {
    let x = map(i, 0, 70, 100, width - 100);
    let y = height - 100;
    line(x, y - 5, x, y + 5);
    textAlign(CENTER, TOP);
    text(i, x, y + 10);
  }

  // write the label for the horizontal scale
  textAlign(CENTER, BOTTOM);
  text("Educational Attainment", width / 2, height - 50);

  // vertical scale goes from 0 to 100
  for (let i = 0; i <= 100; i += 10) {
    let x = 100;
    let y = map(i, 0, 100, height - 100, 100);
    line(x - 5, y, x + 5, y);
    textAlign(RIGHT, CENTER);
    text(i, x - 10, y);
  }

  // write the label for the vertical scale (vertically aligned, rotated 90 degrees counter-clockwise)
  push();
  translate(50, height / 2 - 50);
  rotate(-HALF_PI);
  text("Employment Rate", 0, 0);
  pop();
}

function drawData(year) {
  // Get the data for the selected year
  let attainmentData = educational_attainment[year];
  let employmentData = employment_rate[year];
  let populationData = population[year];

  // Find the maximum population
  let maxPopulation = max(populationData);

  // Draw the data
  for (let i = 0; i < countries.length; i++) {
    // Map the data to the width of the canvas
    let x = map(attainmentData[i], 0, 70, 100, width - 100);
    let y = map(employmentData[i], 0, 100, height - 100, 100);

    // Calculate the size of the flag based on population
    let flagSize = map(populationData[i], 0, maxPopulation, 20, 80);

    // Check if the mouse is over the circle
    let d = dist(mouseX, mouseY, x, y);
    if (d < flagSize / 2) {
      // Update the index of the hovered flag
      hoveredFlagIndex = i;
    }
  }

  // Draw the flags
  for (let i = 0; i < countries.length; i++) {
    // Skip drawing the hovered flag
    if (i === hoveredFlagIndex) {
      continue;
    }

    // Map the data to the width of the canvas
    let x = map(attainmentData[i], 0, 70, 100, width - 100);
    let y = map(employmentData[i], 0, 100, height - 100, 100);

    // Calculate the size of the flag based on population
    let flagSize = map(populationData[i], 0, maxPopulation, 20, 80);

    // make the flag transparent
    tint(255, 100);

    // Draw flag image
    image(flags[countries[i]], x - flagSize / 2, y - flagSize / 2, flagSize, flagSize);

    // Draw the perimeter of the flag
    noFill();
    stroke(0);
    rect(x - flagSize / 2, y - flagSize / 2, flagSize, flagSize);
  }

  // Draw the hovered flag on top
  if (hoveredFlagIndex !== -1) {
    let xHovered = map(attainmentData[hoveredFlagIndex], 0, 70, 100, width - 100);
    let yHovered = map(employmentData[hoveredFlagIndex], 0, 100, height - 100, 100);

    // Calculate the size of the flag based on population
    let flagSizeHovered = map(populationData[hoveredFlagIndex], 0, maxPopulation, 20, 80);

    // make the flag opaque
    tint(255, 255);

    // Draw flag image
    image(flags[countries[hoveredFlagIndex]], xHovered - flagSizeHovered / 2, yHovered - flagSizeHovered / 2, flagSizeHovered, flagSizeHovered);

    // Draw the perimeter of the hovered flag
    noFill();
    stroke(255, 0, 0); // Highlight in red
    rect(xHovered - flagSizeHovered / 2, yHovered - flagSizeHovered / 2, flagSizeHovered, flagSizeHovered);

    // draw the data of the hovered flag on the top left corner
    fill(0);
    stroke(0);
    textAlign(LEFT, TOP);
    text(countries[hoveredFlagIndex], 10, 10);
    textAlign(LEFT, TOP);
    text("Educational Attainment: " + attainmentData[hoveredFlagIndex] + "%", 10, 30);
    text("Employment Rate: " + employmentData[hoveredFlagIndex] + "%", 10, 45);
    text("Immigrant Population: " + populationData[hoveredFlagIndex], 10, 60);
  }
}

function createYearSelector(years) {
  // fill the html element with id "year" with the selected year
  let yearSelector = document.getElementById("selectYear");

  // fill with options 
  yearSelector.innerHTML = "";
  for (let i = 1; i < years.length; i++) {
    let option = document.createElement("option");
    option.text = years[i];
    yearSelector.add(option);
  }
  yearSelector.onchange = updateYear;

  // set the default value
  yearSelector.value = selectedYear;
}

function updateYear() {
  selectedYear = this.value;
  console.log(selectedYear);
}