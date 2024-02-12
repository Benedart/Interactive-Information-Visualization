var countrySketch = function (p) {
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
  p.preload = function () {
    /* read csv file */
    attainment_table = p.loadTable("data/Procesed Eurostat Dataset.csv", "csv", "header");
    employment_table = p.loadTable("data/Employment-Processed-Temp.csv", "csv", "header");
    population_table = p.loadTable("data/Population-Migrant-AllAge-FinalwithNum.csv", "csv", "header");
  }

  p.windowResized = function () {
    // Ajusta el tamaño del canvas cuando se cambia el tamaño de la ventana
    p.resizeCanvas(windowWidth * canvasScaler, windowHeight * canvasScaler);
    // Asegúrate de que el redibujado considere el nuevo tamaño para la colocación de elementos
    p.drawData(selectedYear);
  }

  p.setup = function () {
    // put setup code here
    // create a centered canvas
    p.createCanvas(canvas_width, canvas_height);
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
    p.createYearSelector(years);
    // Load flag images
    for (let country of countries) {
      flags[country] = p.loadImage(`data/flags/circles/${country}.png`);
    }
    // set the text type and size
    p.textFont(font_type);
    p.textSize(font_height);
    p.select('#selectYear').style('width', '100px').position(10, canvas_height - 30);
  }

  p.draw = function () {
    p.background(255);
    p.drawAxis();
    p.drawScale();
    p.drawData(selectedYear);
    // Restablecer hoveredFlagIndex a -1 para asegurarse de que no se muestre ningún tooltip si el ratón no está sobre ningún país
    hoveredFlagIndex = -1;
    // Verificar si el ratón está sobre algún país
    for (let i = 0; i < countries.length; i++) {
      let x = p.map(educational_attainment[selectedYear][i], 0, 70, 100, p.width - 100);
      let y = p.map(employment_rate[selectedYear][i], 0, 87, p.height - 100, 100);
      let flagSize = p.map(population[selectedYear][i], 0, p.max(population[selectedYear]), 20, 80);
      if (p.dist(p.mouseX, p.mouseY, x, y) < flagSize / 2) {
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
      let x = p.map(attainment, 0, 70, 100, p.width - 100);
      let y = p.map(employment, 0, 87, p.height - 100, 100);
      p.drawTooltip(country, p.mouseX, p.mouseY, attainment, employment);
    }
  }

  p.mouseClicked = function () {
    let flagClicked = false; // Añadir una bandera para verificar si se hizo clic en algún país
    for (let i = 0; i < countries.length; i++) {
      let x = p.map(educational_attainment[selectedYear][i], 0, 70, 100, p.width - 100);
      let y = p.map(employment_rate[selectedYear][i], 0, 87, p.height - 100, 100);
      let flagSize = p.map(population[selectedYear][i], 0, p.max(population[selectedYear]), 20, 80);
      let d = p.dist(p.mouseX, p.mouseY, x, y);
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

  p.drawTooltip = function (country, x, y, attainment, employment) {
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
    if (tooltipX + tooltipWidth > p.width) {
      tooltipX = width - tooltipWidth - 20; // Mueve el tooltip hacia la izquierda si se sale del lado derecho
    }
    if (tooltipY < 0) {
      tooltipY = y + 20; // Mueve el tooltip hacia abajo si se sale del lado superior
    }
    // Dibujar el rectángulo de fondo
    p.fill(0, 100); // Fondo semi-transparente negro
    p.noStroke(); // Sin borde para el rectángulo de fondo
    p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5); // Rectángulo con bordes redondeados
    // Configurar el texto
    p.fill(255); // Texto blanco para contraste
    p.textSize(12); // Tamaño de texto más pequeño para ajustarse al tooltip
    p.textAlign(p.LEFT, p.TOP); // Alinear texto a la izquierda y arriba
    // Dibujar el texto encima del rectángulo de fondo
    p.text(tooltipText, tooltipX + 10, tooltipY + 5); // Agregar un pequeño margen dentro del rectángulo
  }

  p.drawAxis = function () {
    // Draw horizontal line
    p.stroke(0);
    p.line(100, p.height - 100, p.width - 100, p.height - 100);
    // Draw vertical line
    p.line(100, 40, 100, p.height - 100);
  }

  p.drawScale = function () {
    // horizontal scale goes from 0 to 70
    for (let i = 0; i <= 70; i += 10) {
      let x = p.map(i, 0, 70, 100, p.width - 100);
      let y = p.height - 100;
      p.line(x, y - 5, x, y + 5);
      p.textAlign(p.CENTER, p.TOP);
      p.text(i, x, y + 10);
    }
    // write the label for the horizontal scale
    p.textAlign(p.CENTER, p.BOTTOM);
    p.text("Educational Attainment", p.width / 2 - 75, p.height - 50);
    // vertical scale goes from 0 to 100
    for (let i = 0; i <= 100; i += 10) {
      let x = 100;
      let y = p.map(i, 0, 87, p.height - 100, 100);
      p.line(x - 5, y, x + 5, y);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(i, x - 10, y);
    }
    // write the label for the vertical scale (vertically aligned, rotated 90 degrees counter-clockwise)
    p.push();
    p.translate(50, p.height / 2 - 87);
    p.rotate(-p.HALF_PI);
    p.text("Employment Rate", 0, 0);
    p.pop();
  }

  p.drawData = function (year) {
    // Get the data for the selected year
    let attainmentData = educational_attainment[year];
    let employmentData = employment_rate[year];
    let populationData = population[year];
    // Find the maximum population
    let maxPopulation = p.max(populationData);
    // Draw the data
    for (let i = 0; i < countries.length; i++) {
      // Map the data to the width of the canvas
      let x = p.map(attainmentData[i], 0, 70, 100, p.width - 100);
      let y = p.map(employmentData[i], 0, 87, p.height - 100, 100);
      // Calculate the size of the flag based on population
      let flagSize = p.map(populationData[i], 0, maxPopulation, 20, 80);
      // Check if the mouse is over the circle
      let d = p.dist(p.mouseX, p.mouseY, x, y);
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
      let x = p.map(attainmentData[i], 0, 70, 100, p.width - 100);
      let y = p.map(employmentData[i], 0, 87, p.height - 100, 100);
      // Calculate the size of the flag based on population
      let flagSize = p.map(populationData[i], 0, maxPopulation, 20, 80);
      // make the flag transparent
      p.tint(255, 100);
      // Draw flag image
      p.image(flags[countries[i]], x - flagSize / 2, y - flagSize / 2, flagSize, flagSize);
      // Draw the perimeter of the flag
      p.noFill();
      p.stroke(0);
      p.circle(x, y, flagSize, flagSize);
    }
    // Draw the hovered flag on top
    if (hoveredFlagIndex !== -1) {
      let xHovered = p.map(attainmentData[hoveredFlagIndex], 0, 70, 100, p.width - 100);
      let yHovered = p.map(employmentData[hoveredFlagIndex], 0, 87, p.height - 100, 100);
      // Calculate the size of the flag based on population
      let flagSizeHovered = p.map(populationData[hoveredFlagIndex], 0, maxPopulation, 20, 80);
      // make the flag opaque
      p.tint(255, 255);
      // Draw flag image
      p.image(flags[countries[hoveredFlagIndex]], xHovered - flagSizeHovered / 2, yHovered - flagSizeHovered / 2, flagSizeHovered, flagSizeHovered);
      // Draw the perimeter of the hovered flag
      p.noFill();
      p.stroke(255, 0, 0); // Highlight in red
      p.circle(xHovered, yHovered, flagSizeHovered, flagSizeHovered);
    }
  }

  p.createYearSelector = function (years) {
    // fill the html element with id "year" with the selected year
    let yearSelector = document.getElementById("selectYear");
    // fill with options 
    yearSelector.innerHTML = "";
    for (let i = 1; i < years.length; i++) {
      let option = document.createElement("option");
      option.text = years[i];
      yearSelector.add(option);
    }
    yearSelector.onchange = p.updateYear;
    // set the default value
    yearSelector.value = selectedYear;
  }

  p.updateYear = function () {
    selectedYear = this.value;
    console.log(selectedYear);
  }
}




var ageDistributionSketch = function (p) {
  p.preload = () => {
    data = p.loadTable("data/ageDistribution.csv", "csv", "header");
  };

  p.setup = () => {
    p.createCanvas(1200, 600);

    yearDropdown = p.createSelect();
    countryDropdown = p.createSelect();

    // Add years to dropdown
    years = data.getColumn('Year');
    yearDropdown.option('Select year');
    years.forEach(year => yearDropdown.option(year));

    // Add countries to dropdown
    countryList = data.getColumn('Country');
    countryDropdown.option('Select country');
    countryList.forEach(country => countryDropdown.option(country));

    yearDropdown.changed(updateGraph);
    countryDropdown.changed(updateGraph);
  };

  p.draw = function () {
    // Clear the canvas
    p.background(220);

    // Set up the axes and labels
    p.textAlign(p.RIGHT, p.CENTER);
    p.fill(0);
    p.textSize(12);
    p.strokeWeight(1);
    p.line(50, 50, 50, p.height - 50); // Y-axis line
    p.line(50, p.height - 50, p.width - 50, p.height - 50); // X-axis line
    p.text("Quantity of migrants", 210, p.height - 40); // X-axis label

    // Rotate the Y-axis label
    p.push();
    p.translate(20, p.height / 2);
    p.rotate(-p.HALF_PI);
    p.text("Age Groups", 50, 10); // Y-axis label
    p.pop();

    // Get the selected year and country
    const selectedYear = yearDropdown.value();
    const selectedCountry = countryDropdown.value();

    // TODO: Filter data based on the selected options
    const filteredRows = data.rows.filter(row => row.get('Year') === "2020" && row.get('Country') === "WORLD");

    // Check if there are any filtered rows
    if (filteredRows.length > 0) {
      // Assuming 'ageGroups' is an array of age group labels
      const ageGroups = data.columns.slice(6);

      // remove the last column, which is the total
      ageGroups.splice(-1, 1);

      // Find the maximum value between all age groups
      let maxValue = 0;
      for (let i = 0; i < ageGroups.length; i++) {
        let value = filteredRows[0].get(ageGroups[i]); // Assuming all rows have the same value for this age group
        if (value > maxValue) {
          maxValue = value;
        }
      }

      // Calculate the height of each bar and the space between them
      const barHeight = (p.height - 100) / ageGroups.length - 10;
      const barSpacing = 10;

      // Draw the bars
      p.noStroke();
      for (let i = 0; i < ageGroups.length; i++) {
        let value = filteredRows[0].get(ageGroups[i]);
        let x = 100;
        let y = 50 + i * (barHeight + barSpacing);
        let barWidth = p.map(value, 0, maxValue, 0, p.width - 1000);
        p.fill(0);
        p.rect(x, y, barWidth, barHeight);
        p.fill(0);
        p.text(ageGroups[i], x - 10, y + barHeight / 2);
      }

      // Draw the title
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(18);
      p.text("Age Distribution", p.width / 2, 20);

      // if you hover over the bar, it will show the value
      p.textSize(12);
      for (let i = 0; i < ageGroups.length; i++) {
        let value = filteredRows[0].get(ageGroups[i]);
        let x = 100;
        let y = 50 + i * (barHeight + barSpacing);
        let barWidth = p.map(value, 0, maxValue, 0, p.width - 1000);
        if (p.mouseX > x && p.mouseX < x + barWidth && p.mouseY > y && p.mouseY < y + barHeight) {
          p.fill(0);
          p.text(value, x + barWidth + 40, y + barHeight / 2);
        }
      }
    } else {
      p.text("No data available for the selected year and country.", 50, p.height / 2);
    }
  }

  function updateGraph() {
    console.log('Updating graph...');
    p.redraw();
  }
};

var myp5 = new p5(countrySketch, 'sketch-holder');
var ageDistributionP5 = new p5(ageDistributionSketch, 'age-distribution-holder');