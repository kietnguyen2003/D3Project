export const processCSVWithD3 = async (filePath) => {
  try {
    const rawData = await d3.csv(filePath);

    const jsonOutput = JSON.stringify(rawData, null, 2);
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(blob);
    console.log("JSON file URL:", jsonUrl);

    const csvOutput = d3.csvFormat(rawData);
    const csvBlob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    console.log("CSV file URL:", csvUrl);

    return rawData;
  } catch (error) {
    console.error("Lỗi khi xử lý file CSV:", error);
    return [];
  }
};

export const test = async (data, selector) => {
  const width = 800;
  const height = 600;
  const margin = { top: 20, right: 300, bottom: 100, left: 120 };

  const svg = d3.select(selector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  if (!data || data.length === 0) {
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "gray")
      .text("Không có dữ liệu tương ứng");
    return;
  }

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.Brand))
    .range([0, width])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d.total_ratings_reviews))])
    .nice()
    .range([height, 0]);

  const colorScale = d3.scaleLinear()
    .domain([3.6, 4.1, 4.6])
    .range(["#fdae61", "#ffffbf", "#2b5c8a"]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)") // Rotate the label for the Y-axis
    .attr("y", 0 - margin.left + 20)  // Adjust position of the label
    .attr("x", 0 - height / 2)        // Adjust position of the label
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("RATINGS + REVIEW");

  // Add X-axis label
  svg.append("text")
    .attr("x", width / 2)              // Center horizontally
    .attr("y", height + margin.bottom - 10) // Adjust position below the X-axis
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("BRAND");

  // Thêm tiêu đề cho SVG
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2 - margin.left) // Căn giữa theo chiều ngang
    .attr("y", -margin.top + 90) // Đặt tiêu đề ở trên cùng
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Bar Chart of Ratings and Reviews by Brand"); // Nội dung tiêu đề
  

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.Brand))
    .attr("y", height)
    .attr("width", xScale.bandwidth())
    .attr("height", 0)
    .style("fill", d => colorScale(parseFloat(d.Stars)))
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`
          <strong>Brand:</strong> ${d.Brand}<br>
          <strong>Stars:</strong> ${parseFloat(d.Stars).toFixed(2)}<br>
          <strong>Ratings:</strong> ${parseInt(d.Rating).toLocaleString()}<br>
          <strong>Reviews:</strong> ${parseInt(d.Reviews).toLocaleString()}<br>
        `);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY + 10}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    })
    .transition()
    .duration(1000)
    .attr("y", d => yScale(parseInt(d.total_ratings_reviews)))
    .attr("height", d => height - yScale(parseInt(d.total_ratings_reviews)));

  const legendHeight = 10;
  const legendWidth = 300;

  const legendScale = d3.scaleLinear()
    .domain([3.6, 4.6])
    .range([0, legendWidth]);

  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#fdae61");
  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", "#ffffbf");
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#2b5c8a");

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 35}, ${height - 250})`);

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale).ticks(5));

  legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", legendHeight + 40) // Position below the legend
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Stars");
};
