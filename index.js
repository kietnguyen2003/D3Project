export async function drawTreemap(data, selector) {
  const width = 900;
  const height = 600;

  // Convert data to hierarchical format
  const hierarchy = d3.hierarchy({ children: data })
      .sum(d => d.Reviews) // Use "Reviews" to size the rectangles
      .sort((a, b) => b.value - a.value); // Sort by value

  // Create a Treemap layout
  const treemap = d3.treemap()
      .size([width, height])
      .padding(1);

  treemap(hierarchy);

  // Create an SVG element
  const svg = d3.select(selector)
      .append("svg")
      .attr("width", width + 400)
      .attr("height", height); // Add extra height for the legend

  // Define a color scale for Stars
  const colorScale = d3.scaleSequential()
      .domain([3, 5]) // Assuming Stars range from 3 to 5
      .interpolator(d3.interpolateBlues);

  // Create Tooltip
  const tooltip = d3.select(selector)
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0);

  // Add rectangles for each node
  const nodes = svg.selectAll("g")
      .data(hierarchy.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`); // Shift Treemap down

  nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.Stars)) // Color based on Stars using color scale
      .attr("stroke", "white")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>Brand:</strong> ${d.data.Brand}<br>
            <strong>Reviews:</strong> ${d.data.Reviews.toLocaleString()}<br>
            <strong>Stars:</strong> ${d.data.Stars}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

  // Add brand name and Reviews count inside each rectangle
  nodes.append("text")
      .attr("x", 5)
      .attr("y", 20)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(d => d.data.Brand);

  nodes.append("text")
      .attr("x", 5)
      .attr("y", 40)
      .style("font-size", "10px")
      .style("fill", "white")
      .text(d => d.data.Reviews.toLocaleString());

  // Add color legend at the top
  const legendWidth = 300;
  const legendHeight = 20;

  const legend = svg.append("g")
      .attr("transform", `translate(${(width - legendWidth) +350}, 20)`);

  // Gradient
  const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

  gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(3)); // Start color (lowest Stars)

  gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(5)); // End color (highest Stars)

  // Add legend rectangle
  legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

  // Add legend labels
  legend.append("text")
      .attr("x", 0)
      .attr("y", legendHeight + 15)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("3");

  legend.append("text")
      .attr("x", legendWidth)
      .attr("y", legendHeight + 15)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("5");

  legend.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 15)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Stars");
}

export async function drawBarChart(data, selector, key, title) {
  const margin = { top: 50, right: 30, bottom: 50, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Xóa biểu đồ cũ (nếu có)
  d3.select(selector).selectAll("*").remove();

  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.Brand))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[key])])
    .nice()
    .range([height, 0]);

  // Sắp xếp dữ liệu giảm dần theo key
  data.sort((a, b) => b[key] - a[key]);

  // Thêm trục X
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Thêm trục Y
  svg.append("g").call(d3.axisLeft(y));

  // Tạo tooltip
  const tooltip = d3
    .select(selector)
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Vẽ các thanh cột
  svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Brand))
    .attr("y", height) // Bắt đầu từ đáy
    .attr("width", x.bandwidth())
    .attr("height", 0) // Chiều cao ban đầu là 0
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>Brand:</strong> ${d.Brand}<br>
           <strong>${key}:</strong> ${d[key].toLocaleString()}`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    })
    .transition() // Thêm hiệu ứng chuyển đổi
    .duration(1000) // Thời gian chuyển đổi 1 giây
    .attr("y", d => y(d[key]))
    .attr("height", d => height - y(d[key]));

  // Thêm tiêu đề
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(title);
}
