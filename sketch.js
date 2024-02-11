// set our canvas size, unit is pixel
var canvas_width = 1350;
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

let canvasScaler = 0.75;

// Variable to store the index of the currently hovered flag
let hoveredFlagIndex = -1;

/* preload the data */
function preload() {
  /* read csv file */
  attainment_table = loadTable("data/Procesed Eurostat Dataset.csv", "csv", "header");
  employment_table = loadTable("data/Employment-Processed-Temp.csv", "csv", "header");
  population_table = loadTable("data/Population-Migrant-AllAge-FinalwithNum.csv", "csv", "header");
}

function windowResized() {
  // Ajusta el tamaño del canvas cuando se cambia el tamaño de la ventana
  resizeCanvas(windowWidth * canvasScaler, windowHeight * canvasScaler);
  // Asegúrate de que el redibujado considere el nuevo tamaño para la colocación de elementos
  drawData(selectedYear);
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
  select('#selectYear').style('width', '100px').position(10, canvas_height - 30);
}

function draw() {
  background(255);
  drawAxis();
  drawScale();
  drawData(selectedYear);
  // Restablecer hoveredFlagIndex a -1 para asegurarse de que no se muestre ningún tooltip si el ratón no está sobre ningún país
  hoveredFlagIndex = -1;
  // Verificar si el ratón está sobre algún país
  for (let i = 0; i < countries.length; i++) {
    let x = map(educational_attainment[selectedYear][i], 0, 70, 100, width - 100);
    let y = map(employment_rate[selectedYear][i], 0, 87, height - 100, 100);
    let flagSize = map(population[selectedYear][i], 0, max(population[selectedYear]), 20, 80);
    if (dist(mouseX, mouseY, x, y) < flagSize / 2) {
      hoveredFlagIndex = i;
      break; // Deja de buscar una vez que encuentres un país bajo el cursor
    }
  }
  
  // Si hoveredFlagIndex no es -1, dibuja el tooltip
  if (hoveredFlagIndex !== -1) {
    let country = countries[hoveredFlagIndex];
    let attainment = educational_attainment[selectedYear][hoveredFlagIndex];
    let employment = employment_rate[selectedYear][hoveredFlagIndex];
    // Asegúrate de que las coordenadas x, y que pasas aquí sean las posiciones en el lienzo donde debe aparecer el tooltip
    let x = map(attainment, 0, 70, 100, width - 100);
    let y = map(employment, 0, 87, height - 100, 100);
    drawTooltip(country, mouseX, mouseY, attainment, employment);
  }
}

function mouseClicked() {
  let flagClicked = false; // Añadir una bandera para verificar si se hizo clic en algún país
  for (let i = 0; i < countries.length; i++) {
    let x = map(educational_attainment[selectedYear][i], 0, 70, 100, width - 100);
    let y = map(employment_rate[selectedYear][i], 0, 87, height - 100, 100);
    let flagSize = map(population[selectedYear][i], 0, max(population[selectedYear]), 20, 80);
    let d = dist(mouseX, mouseY, x, y);
    if (d < flagSize / 2) {
      // Si se hace clic dentro del área de un país, muestra la información del país
      let country = countries[i];
      let attainment = educational_attainment[selectedYear][i];
      let employment = employment_rate[selectedYear][i];
      document.getElementById("countryInfo").innerHTML = `${country}<br>Educational Attainment: ${attainment}%<br>Employment Rate: ${employment}%`;
      document.getElementById("countryInfo").style.display = "block";
      flagClicked = true; // Indicar que se hizo clic en un país
      break; // Deja de buscar una vez que encuentres un país bajo el cursor
    }
  }
  if (!flagClicked) {
    // Si no se hizo clic en ningún país, ocultar la información del país
    document.getElementById("countryInfo").style.display = "none";
  }
}

function drawTooltip(country, x, y, attainment, employment) {
  // Preparar el texto del tooltip
  let tooltipText = `${country}\nEducational Attainment: ${attainment}%\nEmployment Rate: ${employment}%`;
  // Calcular el ancho y alto del tooltip basado en el texto
  // Asumiendo que el ancho máximo es 200px para simplificar
  let tooltipWidth = 185; // Ancho máximo del tooltip
  let tooltipHeight = 55; // Altura estimada basada en el contenido
  // Posición del tooltip ajustada para evitar que se dibuje fuera del canvas
  let tooltipX = x + 20; // Desplaza el tooltip un poco a la derecha del cursor para evitar solapamiento
  let tooltipY = y - tooltipHeight - 10; // Desplaza arriba del cursor
  // Ajustar la posición del tooltip si se sale del canvas
  if (tooltipX + tooltipWidth > width) {
    tooltipX = width - tooltipWidth - 20; // Mueve el tooltip hacia la izquierda si se sale del lado derecho
  }
  if (tooltipY < 0) {
    tooltipY = y + 20; // Mueve el tooltip hacia abajo si se sale del lado superior
  }
  // Dibujar el rectángulo de fondo
  fill(0, 100); // Fondo semi-transparente negro
  noStroke(); // Sin borde para el rectángulo de fondo
  rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5); // Rectángulo con bordes redondeados
  // Configurar el texto
  fill(255); // Texto blanco para contraste
  textSize(12); // Tamaño de texto más pequeño para ajustarse al tooltip
  textAlign(LEFT, TOP); // Alinear texto a la izquierda y arriba
  // Dibujar el texto encima del rectángulo de fondo
  text(tooltipText, tooltipX + 10, tooltipY + 5); // Agregar un pequeño margen dentro del rectángulo
}

function drawAxis() {
  // Draw horizontal line
  stroke(0);
  line(100, height - 100, width - 100, height - 100);
  // Draw vertical line
  line(100, 40, 100, height - 100);
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
  text("Educational Attainment", width / 2 - 75, height - 50);
  // vertical scale goes from 0 to 100
  for (let i = 0; i <= 100; i += 10) {
    let x = 100;
    let y = map(i, 0, 87, height - 100, 100);
    line(x - 5, y, x + 5, y);
    textAlign(RIGHT, CENTER);
    text(i, x - 10, y);
  }
  // write the label for the vertical scale (vertically aligned, rotated 90 degrees counter-clockwise)
  push();
  translate(50, height / 2 - 87);
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
    let y = map(employmentData[i], 0, 87, height - 100, 100);
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
    let y = map(employmentData[i], 0, 87, height - 100, 100);
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
    let yHovered = map(employmentData[hoveredFlagIndex], 0, 87, height - 100, 100);
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