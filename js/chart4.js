export const process4CSVWithD3 = async (dataPath) => {
  try {
    const rawData = await d3.csv(dataPath);

    const filteredData = rawData.map(d => ({
      brand: d.Brand,
      displaySize: +d['Display Size (inch)'],
      productCount: +d['Product Count']
    }));

    const jsonOutput = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(blob);
    console.log("JSON file URL:", jsonUrl);

    const csvOutput = d3.csvFormat(filteredData);
    const csvBlob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    console.log("CSV file URL:", csvUrl);
    console.log("data3: ", filteredData);
    return filteredData;
  } catch (error) {
    console.error("Error when processing CSV file:", error);
    return [];
  }
}

export async function drawTreemap(data, selector, brand) {
  const width = 900;
  const height = 600;
  const margin = { top: 40, right: 30, bottom: 150, left: 40 };

  console.log("Original data: ", data);

  const filteredData = data.filter(d => d.brand === brand);
  console.log("Filtered data: ", filteredData);

  const hierarchy = d3.hierarchy({ children: filteredData })
    .sum(d => d.productCount) 
    .sort((a, b) => b.value - a.value); 

  const treemap = d3.treemap()
    .size([width, height - margin.top])
    .padding(1);

  treemap(hierarchy);

  // Create a color scale with the specified color range
  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(hierarchy.leaves(), d => d.value) / 2, d3.max(hierarchy.leaves(), d => d.value)]) // Divide into 3 parts
    .range(["#fdae61", "#ffffbf", "#2b5c8a"]); // Custom color range

  // Step 4: Create SVG element
  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Add the title above the treemap
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", margin.top / 2) // Center the title within the top margin
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`Treemap of ${brand} by Product Count`);

  // Create a group for the treemap within the SVG
  const treemapGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Step 5: Draw rectangles for each node
  const nodes = treemapGroup.selectAll("g")
    .data(hierarchy.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  // Draw rectangles (treemap cells)
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.data.productCount)) // Apply the custom color scale
    .attr("stroke", "white");

  // Add text labels (brand name and product count) inside each rectangle
  nodes.append("text")
    .attr("x", 5)
    .attr("y", 20)
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "white")
    .text(d => d.data.brand);

  nodes.append("text")
    .attr("x", 5)
    .attr("y", 40)
    .style("font-size", "10px")
    .style("fill", "white")
    .text(d => d.data.productCount.toLocaleString());

  // Step 6: Create tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

  // Hover behavior: Show tooltip on mouseover
  nodes.on("mouseover", (event, d) => {
    tooltip.style("display", "block")
      .html(`
        <strong>Brand:</strong> ${d.data.brand}<br>
        <strong>Display Size:</strong> ${d.data.displaySize} inch<br>
        <strong>Product Count:</strong> ${d.data.productCount.toLocaleString()}
      `)
      .style("top", `${event.pageY + 10}px`)
      .style("left", `${event.pageX + 10}px`);
  })
  .on("mousemove", event => {
    tooltip.style("top", `${event.pageY + 10}px`)
      .style("left", `${event.pageX + 10}px`);
  })
  .on("mouseout", () => {
    tooltip.style("display", "none");
  });
}
