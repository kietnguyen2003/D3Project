export const process3CSVWithD3 = async (dataPath) => {
  try {
    const rawData = await d3.csv(dataPath);

    const filteredData = rawData.map(d => ({
      classification: d.classification,
      actualPrice: +d['Actual price'],
      discountPrice: +d['Discount price']
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

export const test3 = async (data, selector) => {
  const datatemp = [
    { classification: 'High popularity and highly rated', actualPrice: 54355.415384615386, discountPrice: 49567.74615384615 },
    { classification: 'High popularity and moderate ratings', actualPrice: 20453.01886792453, discountPrice: 16590.64441219158 },
    { classification: 'High popularity but low ratings', actualPrice: 4011.7297297297296, discountPrice: 3236.3513513513512 },
    { classification: 'Low popularity and low ratings', actualPrice: 15984.714285714286, discountPrice: 14382.0 },
    { classification: 'Lower popularity and moderate ratings', actualPrice: 11337.692307692309, discountPrice: 47889.46153846154 },
    { classification: 'Lower popularity but highly rated', actualPrice: 28152.533333333333, discountPrice: 44709.46666666667 },
    { classification: 'Medium popularity and highly rated', actualPrice: 21332.777777777777, discountPrice: 44776.77777777778 },
    { classification: 'Medium popularity and low ratings', actualPrice: 1619.0, discountPrice: 1163.0 },
    { classification: 'Medium popularity and moderate ratings', actualPrice: 16380.363636363636, discountPrice: 16332.987012987012 }
  ];

  console.log("data3: ", data);

  const margin = { top: 20, right: 30, bottom: 150, left: 100 };
  const width = 1000;
  const height = 600;

  const svg = d3.select(selector).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand()
    .domain(data.map(d => d.classification))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.actualPrice, d.discountPrice))])
    .nice()
    .range([height, 0]);

  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

  svg.append('g')
    .selectAll('g')
    .data(data)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d.classification)},0)`)
    .selectAll('rect')
    .data(d => [{ value: d.actualPrice, key: 'Actual price' }, { value: d.discountPrice, key: 'Discount price' }])
    .enter().append('rect')
    .attr('x', (d, i) => i * (x0.bandwidth() / 2))
    .attr('y', height)
    .attr('width', x0.bandwidth() / 2)
    .attr('height', 0)
    .style('fill', d => d.key === 'Actual price' ? 'steelblue' : 'orange')
    .style('stroke', 'white')
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`
          <strong>Classification:</strong> ${d.key}<br>
          <strong>Price:</strong> ${d.value.toFixed(2)}
        `);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY + 10}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    })
    .transition()
    .duration(1000)
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value));

  svg.append('g')
    .selectAll('.tick')
    .data(y.ticks())
    .enter().append('g')
    .append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))

  svg.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y))
    .selectAll('.tick text')
    .style('font-size', '12px')
    .style('text-anchor', 'middle')
    .attr('dx', '-1em');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('.tick text')
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .attr('transform', 'rotate(-45)')
    .attr('dx', '-0.8em')
    .attr('dy', '0.5em');

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top)
    .style('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Actual vs Discount Prices for Each Classification');

  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 40)
  .attr("x", -(height / 2))
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .text("Price (USD)");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Classification");

  const legend = svg.append('g')
    .attr('transform', `translate(${width - 200},${30})`);

  legend.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('fill', 'steelblue');

  legend.append('text')
    .attr('x', 25)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('font-size', '12px')
    .text('Avg Actual Price');

  legend.append('rect')
    .attr('width', 18)
    .attr('height', 18)
    .attr('fill', 'orange')
    .attr('y', 25);

  legend.append('text')
    .attr('x', 25)
    .attr('y', 34)
    .attr('dy', '.35em')
    .style('font-size', '12px')
    .text('Avg Discount Price');
};
