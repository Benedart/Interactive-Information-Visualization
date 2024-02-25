document.addEventListener("DOMContentLoaded", function () {
    const switchButton = document.getElementById("switchChart");
    const d3Visualization = document.getElementById("d3-visualization");
    const p5Visualization = document.getElementById("p5-visualization");

    var selectedCountry = "OECD";

    // import dataset for stats about education vs non-education, the separator is a semicolon
    d3.csv("data/merged.csv").then(function (data) {
        console.log(data);

        const updateChart = (selectedCountry) => {
            // Delete the previous circles with a transition
            svg.selectAll("circle")
                .remove();

            // Delete the previous text with a transition
            svg.selectAll(".info")
                .remove();

            // update the chart title
            d3.select("#title").text("Young People in " + selectedCountry);

            // display the circles based on the totalpopulation and groupsize
            groups = Math.ceil(totalPopulation / groupSize);
            circleData = Array.from({ length: groups }, (_, i) => i);

            svg.selectAll("circle")
                .data(circleData)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => {
                    const col = i % Math.floor(Math.sqrt(groups));
                    return margin.left + (2 * col + 1) * (radius + marginBetweenCircles);
                })
                .attr("cy", (d, i) => {
                    const row = Math.floor(i / Math.floor(Math.sqrt(groups)));
                    return margin.top + (2 * row + 1) * (radius + marginBetweenCircles);
                })
                .attr("r", 0) // Start with zero radius for smooth transition
                .style("fill", "grey")
                .transition("appearCircles")
                .duration(100)
                .delay((d, i) => i) // Delay each circle for a staggered effect
                .attr("r", radius); // Transition to the final radius

            console.log("AAAAAAAA", margin)

            // add a label to explain the chart
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 10)
                .attr("text-anchor", "middle")
                .attr("class", "info")
                .text("Each circle represents 100'000 young people (aged 18-24)");

            // add a label with the total population
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 30)
                .attr("text-anchor", "middle")
                .attr("class", "info")
                .text("Total Population: " + totalPopulation.toLocaleString() + " young people");

            // if scrolled, we should color the circles
            if (scrolled) {
                educationPercentage = data.filter(d => d.Country === selectedCountry)[0].Education / 100;

                // update the title
                d3.select("#title").text("Young People in " + selectedCountry + " (Education vs Non-Education)");

                // add how many people are in education in the info
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", 50)
                    .attr("text-anchor", "middle")
                    .attr("class", "info")
                    .attr("id", "educationInfo")
                    .text("Young people in Education: " + educationPercentage * 100 + "% (" + (educationPercentage * totalPopulation).toLocaleString() + ")");

                svg.selectAll("circle")
                    .style("fill", (d, i) => {
                        return i / (totalPopulation / groupSize) <= educationPercentage ? "orange" : "grey";
                    });
            }
        };

        function handleScroll() {
            if (!scrolled) return;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const chartOffsetTop = document.getElementById("chart").offsetTop;
            const sectionOffsetTop = document.getElementById("highlightedSection").offsetTop;
            const sectionHeight = document.getElementById("highlightedSection").offsetHeight;

            const sectionEmploymentOffsetTop = document.getElementById("employment").offsetTop;
            const sectionEmploymentHeight = document.getElementById("employment").offsetHeight;

            const sectionConclusionOffsetTop = document.getElementById("conclusion").offsetTop;
            const sectionConclusionHeight = document.getElementById("conclusion").offsetHeight;

            // Calculate the scroll progress based on reaching the second section
            const scrollProgress = Math.max(0, Math.min(1, (scrollTop - sectionOffsetTop + window.innerHeight) / sectionHeight));

            // Calculate the scroll progress based on reaching the third section
            const scrollProgressEmployment = Math.max(0, Math.min(1, (scrollTop - sectionEmploymentOffsetTop + window.innerHeight) / sectionEmploymentHeight));

            // Calculate the scroll progress based on reaching the fifth section
            const scrollProgressConclusion = Math.max(0, Math.min(1, (scrollTop - sectionConclusionOffsetTop + window.innerHeight) / sectionConclusionHeight));

            console.log("Scroll Progress: ", scrollProgress);
            console.log("Scroll Progress Employment: ", scrollProgressEmployment);
            console.log("Scroll Progress Conclusion: ", scrollProgressConclusion);
            console.log("Current Chart Type: ", currentChartType);

            if (scrollProgress >= 0.6) {
                scrolled = true
            } else {
                scrolled = false
            }

            console.log(totalPopulation)

            educationPercentage = data.filter(d => d.Country === selectedCountry)[0].Education / 100;
            console.log("Education Percentage for " + selectedCountry + ":", educationPercentage);

            // Update the chart based on the scroll progress
            svg.selectAll("circle")
                .transition("colorCircles")
                .duration(500)
                .style("fill", (d, i) => {
                    if (scrollProgress >= 0.6) {
                        return i / (totalPopulation / groupSize) <= educationPercentage ? "orange" : "grey";
                    } else {
                        return "grey";
                    }
                });

            // add how many people are in education in the info
            svg.selectAll("#educationInfo").remove();
            if (scrollProgress >= 0.6 && currentChartType === "circle") {
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", 50)
                    .attr("text-anchor", "middle")
                    .attr("class", "info")
                    .attr("id", "educationInfo")
                    .text("Young people in Education: " + educationPercentage * 100 + "% (" + (educationPercentage * totalPopulation).toLocaleString() + ")");
            }

            // Show legend if scroll progress exceeds a threshold
            if (scrollProgress >= 0.6 && scrollProgress < 1 && currentChartType === "circle") {
                d3.select(".legend").style("display", "block");

                // if its not there, we should add it
                if (svg.selectAll(".legend").empty()) {
                    const legend = svg.append("g")
                        // should be below the graph
                        .attr("transform", "translate(" + (200) + "," + (height - 290) + ")")
                        .attr("class", "legend")

                    legend.append("rect")
                        .attr("x", -10)
                        .attr("y", -20)
                        .attr("width", 225)
                        .attr("height", 55)
                        .attr("fill", "white")
                        .attr("stroke", "black");

                    legend.append("text")
                        .attr("x", 0)
                        .attr("y", 0)
                        .text("Orange: Young people in Education")
                        .attr("fill", "orange")

                    legend.append("text")
                        .attr("x", 0)
                        .attr("y", 20)
                        .text("Grey: Young people NOT in Education")
                        .attr("fill", "grey");
                }
            } else {
                d3.select(".legend").style("display", "none");
            }

            // if not in the last section, hide the p5.js visualization
            if (scrollProgressConclusion < 0.6) {
                d3Visualization.style.display = "block";
                p5Visualization.style.display = "none";

                // show the select of the country
                document.getElementById("countrySelectDiv").style.display = "block";
            }

            // change the title of the chart based on the scroll progress
            if (scrollProgress < 0.6) {
                d3.select("#title").text("Young People in " + selectedCountry);
                if (currentChartType !== "circle") {
                    transitionToCircleChart();

                    currentChartType = "circle";
                }
            } else if (scrollProgress >= 0.6 && scrollProgress < 1) {
                d3.select("#title").text("Young People in " + selectedCountry + " (Education vs Non-Education)");

                if (currentChartType === "employment" || currentChartType === "earnings") {
                    transitionToCircleChart();

                    currentChartType = "circle";
                }
            } else if (scrollProgressEmployment >= 0.6 && scrollProgressEmployment < 1) {
                if (currentChartType === "employment")
                    d3.select("#title").text("Education vs Employment in " + selectedCountry);
                else if (currentChartType === "earnings")
                    d3.select("#title").text("Education vs Earnings in " + selectedCountry);


                // show the bar chart
                if (currentChartType === "circle" || currentChartType === "bar") {
                    transitionToEmploymentChart();
                }
            } else if (scrollProgressConclusion >= 0.6 && scrollProgressConclusion < 1) {
                d3.select("#title").text("Young People in " + selectedCountry);

                // show p5.js visualization
                d3Visualization.style.display = "none";
                p5Visualization.style.display = "block";

                // hide the select of the country
                document.getElementById("countrySelectDiv").style.display = "none";
            }
        }

        let scrolled = false;

        // Parse unique country names
        const countryNames = [...new Set(data.map(d => d.Country))];

        // Populate select element with options for each country
        const countrySelect = document.getElementById('countrySelect');
        countryNames.forEach(country => {
            const option = document.createElement('option');
            option.text = country;
            countrySelect.add(option);
        });

        countrySelect.value = "OECD"; // Set default selected country

        // Function to update chart based on selected country
        function getPopulation(selectedCountry) {
            const totalPopulation = parseFloat(data.filter(d => d.Country === selectedCountry)[0].Amount);

            console.log("Total Population for " + selectedCountry + ":", totalPopulation);

            return totalPopulation;
        }

        // Initial chart update based on the default selected country
        const initialSelectedCountry = countrySelect.value;
        var totalPopulation = getPopulation(initialSelectedCountry);

        const groupSize = 100000; // Each circle represents 100'000 young people

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        const width = document.getElementById("chart").offsetWidth;
        const height = document.getElementById("chart").offsetHeight;

        const margin = { top: 65, right: 50, bottom: 50, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        var groups = Math.ceil(totalPopulation / groupSize); // Divide the population into groups

        const radius = 7; // Adjust the size of the circles
        const marginBetweenCircles = 1.5; // Adjust the margin between circles

        var circleData = Array.from({ length: groups }, (_, i) => i); // Generate an array of group indices

        updateChart("OECD");

        // Add text at the bottom
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .attr("class", "info")
            .text("Chart Explanation");

        // Add legend for the second visualization
        const legend = svg.append("g")
            // should be below the graph
            .attr("transform", "translate(" + (200) + "," + (height - 290) + ")")
            .attr("class", "legend")

        legend.append("rect")
            .attr("x", -10)
            .attr("y", -20)
            .attr("width", 225)
            .attr("height", 55)
            .attr("fill", "white")
            .attr("stroke", "black");

        legend.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text("Orange: Young people in Education")
            .attr("fill", "orange")

        legend.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .text("Grey: Young people NOT in Education")
            .attr("fill", "grey");


        // Flag to track if animation is in progress
        let animationInProgress = false;

        // Event listener to update chart when select option changes
        countrySelect.addEventListener('change', function () {
            let country = countrySelect.value;
            selectedCountry = country;
            totalPopulation = getPopulation(selectedCountry);
            groups = Math.ceil(totalPopulation / groupSize);

            // Disable scroll event listener during animation
            animationInProgress = true;

            // check what type of chart is currently displayed
            if (currentChartType === "circle") {
                updateChart(selectedCountry);
            } else if (currentChartType === "bar") {
                transitionToBarChart();
            } else if (currentChartType === "employment") {
                transitionToEmploymentChart();
            } else if (currentChartType === "earnings") {
                transitionToEarningsChart();
            }

            animationInProgress = false;
        });

        window.addEventListener('scroll', function () {
            console.log("Scrolled ", scrolled);
            if (!animationInProgress) {
                scrolled = true;
                handleScroll();
            }
        });

        currentChartType = "circle";

        // Add event listener to the button
        const toggleChartButton = document.getElementById("toggle-chart-button");
        toggleChartButton.addEventListener("click", function () {
            // Toggle between circle and bar chart visualizations
            if (currentChartType === "circle") {
                transitionToBarChart();
                currentChartType = "bar";
            } else if (currentChartType === "bar") {
                transitionToCircleChart();
                currentChartType = "circle";
            }
        });

        // Function to transition to bar chart
        function transitionToBarChart() {
            // remove the elements of the circle chart with a transition
            svg.selectAll("circle")
                .transition("removeCircles")
                .duration(1000)
                .attr("r", 0)
                .remove();

            // Set new dimensions for the bar chart SVG
            const barChartWidth = width / 1.3;
            const barChartHeight = height / 1.75;

            // Define transition duration
            const transitionDuration = 1000;

            // Define margins and paddings for the bar chart
            const barChartMargin = { top: 30, right: 30, bottom: 0, left: 100 };
            const barChartInnerWidth = barChartWidth - barChartMargin.left - barChartMargin.right;
            const barChartInnerHeight = barChartHeight - barChartMargin.top - barChartMargin.bottom;

            // Calculate values for the bar chart
            const educationEmployed = data.filter(d => d.Country === selectedCountry)[0].Education_employed;
            const educationUnemployed = data.filter(d => d.Country === selectedCountry)[0].Education_unemployed;
            const educationInactive = data.filter(d => d.Country === selectedCountry)[0].Education_inactive;
            const notEducationEmployed = data.filter(d => d.Country === selectedCountry)[0].NE_employed;
            const neet = data.filter(d => d.Country === selectedCountry)[0].NE_neet;

            // sum education unemployed and inactive (converting to number)
            const educationUnemployedOrInactive = +educationUnemployed + +educationInactive;

            // Group similar categories for better labeling
            const barChartData = [
                { category: "Education (Employed)", value: educationEmployed },
                { category: "Education (Unemployed)", value: educationUnemployedOrInactive },
                { category: "Not in Education (Employed)", value: notEducationEmployed },
                { category: "NEET", value: neet }
            ];

            // Define scales for x and y axes for the bar chart
            const xScale = d3.scaleBand()
                .domain(barChartData.map(d => d.category))
                .range([barChartMargin.left, barChartInnerWidth + barChartMargin.left])
                .padding(0.2); // Adjust padding for more space between bars

            const yScale = d3.scaleLinear()
                .domain([0, 100]) // Set the maximum value of the y-axis to 100
                .nice()
                .range([barChartInnerHeight + barChartMargin.top, barChartMargin.top]);

            // Remove existing bar chart elements
            svg.selectAll("rect").remove();
            svg.selectAll(".bar-text").remove();
            svg.selectAll(".bar-label").remove(); // Remove existing bar labels

            // Draw bars with transition
            svg.selectAll("rect")
                .data(barChartData)
                .enter().append("rect")
                .attr("x", d => xScale(d.category))
                .attr("y", barChartHeight)
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", d => {
                    // Color bars based on category
                    if (d.category === "Education (Employed)") {
                        return "orange";
                    } else if (d.category === "Education (Unemployed)") {
                        // lighter shade of orange
                        return "#ffcc80"
                    } else if (d.category === "Not in Education (Employed)") {
                        return "grey";
                    } else {
                        return "lightgrey";
                    }
                })
                .transition("growBars")
                .duration(transitionDuration)
                .attr("y", d => yScale(d.value))
                .attr("height", d => barChartHeight - yScale(d.value));

            // Add text labels above bars with transition
            svg.selectAll(".bar-text")
                .data(barChartData)
                .enter().append("text")
                .attr("class", "bar-text")
                .attr("x", d => xScale(d.category) + xScale.bandwidth() / 2)
                .attr("y", barChartHeight)
                .attr("text-anchor", "middle")
                .text(d => d.value.toLocaleString() + "%") // Add percentage symbol
                .transition("growText")
                .duration(transitionDuration)
                .attr("y", d => yScale(d.value) - 5);

            // create the x-axis
            const xAxis = d3.axisBottom(xScale);
            svg.append("g")
                .attr("transform", `translate(0, ${barChartHeight})`)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .attr("text-anchor", "end")
                .attr("x", -10)
                .attr("y", 5);

            // create the y-axis
            const yAxis = d3.axisLeft(yScale);
            svg.append("g")
                .attr("transform", `translate(${barChartMargin.left}, 0)`)
                .call(yAxis);

            // Add label to the y-axis
            svg.append("text")
                .attr("class", "bar-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -barChartHeight / 2)
                .attr("y", 0)
                .attr("dy", "3em")
                .style("text-anchor", "middle")
                .text("Percentage (%)");
        }

        function transitionToEmploymentChart() {
            console.log(currentChartType)
            // remove chart elements based on the current chart type
            if (currentChartType === "circle") {
                svg.selectAll("circle")
                    .transition("removeCircles")
                    .duration(1000)
                    .attr("r", 0)
                    .remove();

                svg.selectAll(".info").remove();
            } else if (currentChartType === "bar") {
                svg.selectAll("rect")
                    .transition("removeBars")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                svg.selectAll(".bar-text")
                    .transition("removeText")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                svg.selectAll(".bar-label")
                    .transition("removeLabels")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                // turn the x and y axis off
                svg.selectAll("g").remove();
            } else if (currentChartType === "earnings") {
                // turn the x and y axis off
                svg.selectAll("g").remove();
            }

            // Set new dimensions for the bar chart SVG
            const barChartWidth = width / 1.3;
            const barChartHeight = height / 1.75;

            // Define margins and paddings for the bar chart
            const barChartMargin = { top: 60, right: 30, bottom: 0, left: 100 };
            const barChartInnerWidth = barChartWidth - barChartMargin.left - barChartMargin.right;
            const barChartInnerHeight = barChartHeight - barChartMargin.top - barChartMargin.bottom;

            // columns: Below_upper_secondary,Upper_secondary,Tertiary,Shortcycle_tertiary,Bachelor,Master,Doctoral
            const employmentData = data.filter(d => d.Country === selectedCountry)[0];
            const belowUpperSecondary = +employmentData.Below_upper_secondary;
            const upperSecondary = +employmentData.Upper_secondary;
            const tertiary = +employmentData.Tertiary;
            const shortCycle = +employmentData.Shortcycle_tertiary;
            const bachelor = +employmentData.Bachelor;
            const master = +employmentData.Master;
            const doctoral = +employmentData.Doctoral;

            // Data for the second bar chart
            const secondBarChartData = [
                { category: "Below Upper Secondary Education", value: belowUpperSecondary },
                { category: "Upper Secondary Education", value: upperSecondary },
                //  { category: "Tertiary Education", value: tertiary },
                { category: "Short-cycle Tertiary Education", value: shortCycle },
                { category: "Bachelor's Degree", value: bachelor },
                { category: "Master's Degree", value: master },
                { category: "Doctoral Degree", value: doctoral }
            ];

            // remove the previous elements
            svg.selectAll("rect").remove();
            svg.selectAll(".bar-text").remove();
            svg.selectAll(".bar-label").remove();

            // Define scales for x and y axes for the second bar chart
            const xScale = d3.scaleBand()
                .domain(secondBarChartData.map(d => d.category))
                .range([barChartMargin.left, barChartInnerWidth + barChartMargin.left])
                .padding(0.2);

            const yScale = d3.scaleLinear()
                .domain([0, 100])
                .nice()
                .range([barChartInnerHeight + barChartMargin.top, barChartMargin.top]);

            // Draw bars with transition
            svg.selectAll("rect")
                .data(secondBarChartData)
                .enter().append("rect")
                .attr("x", d => xScale(d.category))
                .attr("y", barChartHeight)
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", (d, i) => {
                    return d3.interpolateOranges(i / secondBarChartData.length);
                })
                .transition("growBarsEmployment")
                .duration(1000)
                .attr("y", d => yScale(d.value))
                .attr("height", d => barChartHeight - yScale(d.value));

            // Add text labels above bars with transition
            svg.selectAll(".bar-text")
                .data(secondBarChartData)
                .enter().append("text")
                .attr("class", "bar-text")
                .attr("x", d => xScale(d.category) + xScale.bandwidth() / 2)
                .attr("y", barChartHeight)
                .attr("text-anchor", "middle")
                .text(d => d.value.toLocaleString() + "%")
                .transition("growText")
                .duration(1000)
                .attr("y", d => yScale(d.value) - 5);

            // Create the x-axis
            const xAxis = d3.axisBottom(xScale);
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${barChartHeight})`)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .attr("text-anchor", "end")
                .attr("x", -10)
                .attr("y", 5);

            // Create the y-axis
            const yAxis = d3.axisLeft(yScale);
            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", `translate(${barChartMargin.left}, 0)`)
                .call(yAxis);

            // Add label to the y-axis
            svg.append("text")
                .attr("class", "bar-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -barChartHeight / 2)
                .attr("y", 0)
                .attr("dy", "3em")
                .style("text-anchor", "middle")
                .text("Employment Rate (%)");

            currentChartType = "employment";
        }

        function transitionToEarningsChart() {
            // remove chart elements based on the current chart type
            if (currentChartType === "circle") {
                svg.selectAll("circle")
                    .transition("removeCircles")
                    .duration(1000)
                    .attr("r", 0)
                    .remove();

                svg.selectAll(".info").remove();
            } else if (currentChartType === "bar") {
                svg.selectAll("rect")
                    .transition("removeBars")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                svg.selectAll(".bar-text")
                    .transition("removeText")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                svg.selectAll(".bar-label")
                    .transition("removeLabels")
                    .duration(1000)
                    .attr("y", height)
                    .remove();

                // turn the x and y axis off
                svg.selectAll("g").remove();
            } else if (currentChartType === "employment" || currentChartType === "earnings") {

                // turn the x and y axis off
                svg.selectAll("g").remove();
            }

            // Set new dimensions for the bar chart SVG
            const barChartWidth = width / 1.3;
            const barChartHeight = height / 1.75;

            // Define margins and paddings for the bar chart
            const barChartMargin = { top: 50, right: 30, bottom: 0, left: 150 };
            const barChartInnerWidth = barChartWidth - barChartMargin.left - barChartMargin.right;
            const barChartInnerHeight = barChartHeight - barChartMargin.top - barChartMargin.bottom;

            // columns: Below_upper_secondary,Upper_secondary,Tertiary,Shortcycle_tertiary,Bachelor,Master,Doctoral
            const employmentData = data.filter(d => d.Country === selectedCountry)[0];
            const earningsBelowUpperSecondary = +employmentData.Earnings_below_upper_secondary;
            const earningsUpperSecondary = +employmentData.Earnings_upper_secondary;
            const earningsTertiary = +employmentData.Earnings_tertiary;
            const earningsShortCycle = +employmentData.Earnings_shortcycle_tertiary;
            const earningsBachelor = +employmentData.Earnings_bachelor;
            const earningsMaster = +employmentData.Earnings_master;
            const earningsDoctoral = +employmentData.Earnings_doctoral;

            // Data for the second bar chart
            const earningsChartData = [
                { category: "Below Upper Secondary Education", value: earningsBelowUpperSecondary },
                { category: "Upper Secondary Education", value: earningsUpperSecondary },
                //    { category: "Tertiary Education", value: earningsTertiary },
                { category: "Short-cycle Tertiary Education", value: earningsShortCycle },
                { category: "Bachelor's Degree", value: earningsBachelor },
                { category: "Master's Degree", value: earningsMaster },
                { category: "Doctoral Degree", value: earningsDoctoral }
            ];

            // remove the previous elements
            svg.selectAll(".bar-text").remove();
            svg.selectAll(".bar-label").remove();
            svg.selectAll("rect").remove();

            // Define scales for x and y axes for the second bar chart
            const xScale = d3.scaleBand()
                .domain(earningsChartData.map(d => d.category))
                .range([barChartMargin.left, barChartInnerWidth + barChartMargin.left])
                .padding(0.2);

            const yScale = d3.scaleLinear()
                .domain([0, 250]) // Set the domain from 0 to 200 for the baseline at 100%
                .nice()
                .range([barChartInnerHeight + barChartMargin.top, barChartMargin.top]);

            // Draw bars with transition
            svg.selectAll("rect")
                .data(earningsChartData)
                .enter().append("rect")
                .attr("x", d => xScale(d.category))
                .attr("y", d => yScale(Math.max(100, d.value))) // Adjust y position to start from 100 baseline
                .attr("width", xScale.bandwidth())
                .attr("height", d => Math.abs(yScale(100) - yScale(d.value))) // Adjust height to accommodate negative values
                .attr("fill", (d, i) => {
                    return d3.interpolateOranges(i / earningsChartData.length);
                })
                .transition("growBarsEarnings")
                .duration(1000)
                .attr("y", d => yScale(Math.max(100, d.value))) // Adjust y position for bars
                .attr("height", d => Math.abs(yScale(100) - yScale(d.value)));

            // if one value is 0, we should say missing data and not show the bar
            svg.selectAll("rect")
                .filter(function (d) { return d.value === 0; })
                .remove();

            // if we have values over 250, we should show them as 250 but with a different color and on hover show the real value
            svg.selectAll("rect")
                .filter(function (d) { return +d.value > 250; })
                .attr("fill", "red")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("fill", "orange");
                    d3.select(this).append("title").text("Earnings: " + d.value + "%");
                })
                .on("mouseout", function (event, d) {
                    d3.select(this).attr("fill", "red");
                    d3.select(this).select("title").remove();
                });

            // Add text labels above bars with transition
            svg.selectAll(".bar-text")
                .data(earningsChartData)
                .enter().append("text")
                .attr("class", "bar-text")
                .attr("x", d => xScale(d.category) + xScale.bandwidth() / 2)
                .attr("y", d => yScale(Math.max(100, d.value)) - 5) // Adjust y position for labels
                .attr("text-anchor", "middle")
                .text(d => d.value.toLocaleString() + "%")
                .transition("growText")
                .duration(1000)
                .attr("y", d => yScale(Math.max(100, d.value)) - 5);

            // Create the x-axis on the 100 baseline
            const xAxis = d3.axisBottom(xScale);
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${yScale(100)})`)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .attr("text-anchor", "end")
                .attr("x", -10)
                .attr("y", 5);

            // Create the y-axis
            const yAxis = d3.axisLeft(yScale)
                .tickValues([0, 50, 100, 150, 200, 250]) // Adjust ticks to include 100 as baseline
                .tickFormat(d => {
                    if (d === 100) return "ISCED 3 Earnings - 100%"; // Change the label at 100 to "ISCED Level 3"
                    return d + "%";
                });

            // Append y-axis to the SVG
            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", `translate(${barChartMargin.left}, 0)`)
                .call(yAxis);

            // Add label to the y-axis
            svg.append("text")
                .attr("class", "bar-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -barChartHeight / 2)
                .attr("y", 0)
                .attr("dy", "3em")
                .style("text-anchor", "middle")
                .text("Earnings (%)");

            // change the title of the chart
            d3.select("#title").text("Education vs Earnings in " + selectedCountry);

            currentChartType = "earnings";
        }

        // Function to transition back to circle chart
        function transitionToCircleChart() {
            // remove the bar chart elements
            svg.selectAll("rect")
                .transition("removeBars")
                .duration(1000)
                .attr("y", height)
                .remove();

            svg.selectAll(".bar-text")
                .transition("removeText")
                .duration(1000)
                .attr("y", height)
                .remove();

            svg.selectAll(".bar-label")
                .transition("removeLabels")
                .duration(1000)
                .attr("y", height)
                .remove();

            // turn the x and y axis off
            svg.selectAll("g").remove();

            // add the legend back from scratch
            const legend = svg.append("g")
                // should be below the graph
                .attr("transform", "translate(" + (200) + "," + (height - 290) + ")")
                .attr("class", "legend")

            legend.append("rect")
                .attr("x", -10)
                .attr("y", -20)
                .attr("width", 225)
                .attr("height", 55)
                .attr("fill", "white")
                .attr("stroke", "black");

            legend.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .text("Orange: Young people in Education")
                .attr("fill", "orange")

            legend.append("text")
                .attr("x", 0)
                .attr("y", 20)
                .text("Grey: Young people NOT in Education")
                .attr("fill", "grey");

            // display the legend
            d3.select(".legend").style("display", "block");

            // Call the updateChart function to redraw circles
            updateChart(selectedCountry);
        }

        // Add event listener to the button
        const employmentDataButton = document.getElementById("employmentDataButton");
        employmentDataButton.addEventListener("click", function () {
            transitionToEmploymentChart();
        });

        const earningsDataButton = document.getElementById("earningsDataButton");
        earningsDataButton.addEventListener("click", function () {
            transitionToEarningsChart();
        });
    });
});

function updateButton() {
    // change the text of the button
    var button = document.getElementById("toggle-chart-button");
    if (button.innerHTML === "More details") {
        button.innerHTML = "Less details";
    } else {
        button.innerHTML = "More details";
    }
}