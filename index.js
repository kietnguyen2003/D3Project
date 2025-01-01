// export function scatterPlot(data, selector) {
//   const margin = { top: 20, right: 20, bottom: 30, left: 40 };
//   const width = 1000 - margin.left - margin.right;
//   const height = 500 - margin.top - margin.bottom;

//   // Tạo SVG container
//   const svg = d3.select(selector)
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   // Tạo color scale để phân biệt các thương hiệu
//   const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
//     .domain(data.map(d => d.Brand));

//   // Tạo scale cho trục X và Y
//   const x = d3.scaleLinear()
//     .domain(d3.extent(data, d => d.Rating))
//     .range([0, width]);

//   const y = d3.scaleLinear()
//     .domain(d3.extent(data, d => d.Reviews))
//     .range([height, 0]);

//   // Vẽ trục X
//   svg.append("g")
//     .attr("transform", `translate(0,${height})`)
//     .call(d3.axisBottom(x));

//   // Vẽ trục Y
//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // Tạo tooltip để hiển thị thông tin khi hover
//   const tooltip = d3.select(selector)
//     .append("div")
//     .style("position", "absolute")
//     .style("background-color", "#f9f9f9")
//     .style("border", "1px solid #ccc")
//     .style("padding", "10px")
//     .style("border-radius", "5px")
//     .style("display", "none")
//     .style("pointer-events", "none");

//   // Vẽ các điểm (scatter plot)
//   svg.selectAll("circle")
//     .data(data)
//     .enter()
//     .append("circle")
//     .attr("cx", d => x(d.Rating))
//     .attr("cy", d => y(d.Reviews))
//     .attr("r", 5)
//     .style("fill", d => colorScale(d.Brand))
//     .style("opacity", 0.8)
//     .on("mouseover", function (event, d) {
//       tooltip
//         .style("display", "block")
//         .html(`
//           <strong>Brand:</strong> ${d.Brand}<br>
//           <strong>Rating:</strong> ${d.Rating}<br>
//           <strong>Reviews:</strong> ${d.Reviews}
//         `)
//         .style("left", `${event.pageX + 10}px`)
//         .style("top", `${event.pageY - 30}px`);
//     })
//     .on("mousemove", function (event) {
//       tooltip
//         .style("left", `${event.pageX + 10}px`)
//         .style("top", `${event.pageY - 30}px`);
//     })
//     .on("mouseout", function () {
//       tooltip.style("display", "none");
//     });

//   // Thêm tiêu đề cho biểu đồ
//   svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", -10)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .style("font-weight", "bold")
//     .text("Scatter Plot: Rating vs Reviews");
// }

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
      .attr("width", width)
      .attr("height", height);

  // Add rectangles for each node
  const nodes = svg.selectAll("g")
      .data(hierarchy.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => d3.interpolateBlues(d.data.Stars / 5)) // Color based on Stars
      .attr("stroke", "white");

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
}
export async function drawBarChart(data, selector, key, title) {
  const margin = { top: 50, right: 30, bottom: 50, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

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

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));

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

  svg.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Brand))
    .attr("y", d => y(d[key]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d[key]))
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
    });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(title);
}

