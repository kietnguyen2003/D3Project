export const process2CSVWithD3 = async (filePath) => {
  try {
    const rawData = await d3.csv(filePath);

    // Lọc chỉ giữ lại các cột cần thiết
    const filteredData = rawData.map(d => ({
      "RAM (GB)": d["RAM (GB)"],
      "Storage (GB)": d["Storage (GB)"],
      "Product Count": d["Product Count"],
      "Avg Price": d["Average Actual Price"],
    }));

    const jsonOutput = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(blob);
    console.log("JSON file URL:", jsonUrl);

    const csvOutput = d3.csvFormat(filteredData);
    const csvBlob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);
    console.log("CSV file URL:", csvUrl);
    console.log("data2: ", filteredData);
    return filteredData;
  } catch (error) {
    console.error("Lỗi khi xử lý file CSV:", error);
    return [];
  }
};

export const renderProductCountHeatmap = (data, selector) => {
  const margin = { top: 50, right: 300, bottom: 100, left: 100 };
  const width = 800 - margin.left;
  const height = 600;

  // Sắp xếp Storage (GB) từ lớn đến nhỏ
  const yValues = [...new Set(data.map(d => +d['Storage (GB)']))].sort((a, b) => b - a);
  const xValues = [...new Set(data.map(d => +d['RAM (GB)']))];

  const max = d3.max(data, d => +d['Product Count']);
  
  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand().domain(xValues).range([0, width]).padding(0.05);
  const yScale = d3.scaleBand().domain(yValues).range([height, 0]).padding(0.05);

  const colorScale = d3.scaleLinear()
    .domain([0, max / 2, max])
    .range(["#fdae61", "#ffffbf", "#2c7bb6"]);

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("display", "none")
    .style("pointer-events", "none");

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(yScale).tickSize(0));

  svg.selectAll("rect")
    .data(data, d => `${d['RAM (GB)']}:${d['Storage (GB)']}`)
    .enter()
    .append("rect")
    .attr("x", d => xScale(+d['RAM (GB)']))
    .attr("y", height) // Bắt đầu từ phía dưới
    .attr("width", xScale.bandwidth())
    .attr("height", 0) // Bắt đầu với chiều cao 0
    .style("fill", d => colorScale(+d['Product Count']))
    .style("stroke", "white")
    .on("mouseover", (event, d) => {
      tooltip.style("display", "block")
        .html(`
          <strong>RAM:</strong> ${d['RAM (GB)']} GB<br>
          <strong>Storage:</strong> ${d['Storage (GB)']} GB<br>
          <strong>Product Count:</strong> ${d['Product Count']}
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
    .attr("y", d => yScale(+d['Storage (GB)']))
    .attr("height", yScale.bandwidth());

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 40)
    .attr("text-anchor", "middle")
    .text("RAM (GB)")
    .style("font-size", "16px")
    .style("font-weight", "bold");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Storage (GB)");

  
  // Thêm tiêu đề cho SVG
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2 - margin.left) // Căn giữa theo chiều ngang
    .attr("y", -margin.top / 2) // Đặt tiêu đề ở trên cùng
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Heatmap of Product Count by RAM and Storage"); // Tiêu đề


  const legendWidth = 200;
  const legendHeight = 10;

  const legendScale = d3.scaleLinear()
    .domain([0, max])
    .range([0, legendWidth]);

  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "product-count-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#fdae61");
  gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ffffbf");
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#2c7bb6");

  const legend = svg.append("g").attr("transform", `translate(${width + 80}, ${height / 2})`);

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#product-count-gradient)");

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(d3.axisBottom(legendScale).ticks(5));
  legend.append("text")
  .attr("x", legendWidth / 2)
  .attr("y", legendHeight + 40) // Position below the legend
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .text("Product Count");
};