function generateHuffmanTree() {
	const input = document.getElementById('input-data').value;
	if (!input) {
	  alert("Please enter a message to encode.");
	  return;
	}
  
	// Count character frequencies from the input string
	const frequencyMap = {};
	for (let char of input) {
	  if (char === '\n') continue; // Only skip newlines
	  // Use '␣' symbol to represent space in visualization
	  const displayChar = char === ' ' ? '_' : char;
	  frequencyMap[displayChar] = (frequencyMap[displayChar] || 0) + 1;
	}
  
	// Convert frequency map to required format "A:5,B:9,C:12"
	const formattedInput = Object.entries(frequencyMap)
	  .map(([char, freq]) => `${char}:${freq}`)
	  .join(', ');
  
	// Display sorted frequencies
	const pairs = formattedInput.split(',').map(s => s.trim().split(':'));
	const frequencies = pairs.map(([char, freq]) => [char, parseInt(freq)]);
  
	document.getElementById('initial-nodes').innerText =
	  'Sorted input: ' + JSON.stringify(frequencies.sort((a, b) => a[1] - b[1]));
  
	buildHuffmanTreeWithAnimation(frequencies).then(root => {
	  const codeMap = {};
	  generateCodes(root, '', codeMap);
	  renderCodeTable(codeMap);
	});
  }
  
  function generateCodes(node, code, codeMap) {
	if (!node.left && !node.right) {
	  codeMap[node.name] = code;
	  return;
	}
	if (node.left) generateCodes(node.left, code + '0', codeMap);
	if (node.right) generateCodes(node.right, code + '1', codeMap);
  }
  
  function renderCodeTable(codeMap) {
	const tbody = document.getElementById('code-table');
	tbody.innerHTML = '';
	for (let key in codeMap) {
	  const tr = document.createElement('tr');
	  tr.innerHTML = `<td>${key}</td><td class="code-binary">${codeMap[key]}</td>`;
	  tbody.appendChild(tr);
	}
  }
  
  async function buildHuffmanTreeWithAnimation(frequencies) {
	const nodes = frequencies.map(([char, freq]) => ({
	  name: char,
	  freq,
	  left: null,
	  right: null,
	}));
  
	const queue = [...nodes].sort((a, b) => a.freq - b.freq);
	const svg = d3.select('svg');
	svg.selectAll('*').remove();
  
	while (queue.length > 1) {
	  const left = queue.shift();
	  const right = queue.shift();
  
	  const parent = {
		name: `${left.name}${right.name}`,
		freq: left.freq + right.freq,
		left,
		right,
	  };
  
	  queue.push(parent);
	  queue.sort((a, b) => a.freq - b.freq);
  
	  drawTree(parent);
	  await new Promise(res => setTimeout(res, 1000)); // 1 sec delay
	}
  
	return queue[0];
  }
  
  function drawTree(root) {
	const svg = d3.select('svg');
	svg.selectAll('*').remove();
  
	const width = 1000;
	const height = 500;
	const treeLayout = d3.tree().size([width - 100, height - 100]);
  
	const hierarchyRoot = d3.hierarchy(root, d => {
	  const children = [];
	  if (d.left) children.push(d.left);
	  if (d.right) children.push(d.right);
	  return children.length ? children : null;
	});
  
	const treeData = treeLayout(hierarchyRoot);
  
	const g = svg.append('g').attr('transform', 'translate(50,50)');
  
	g.selectAll('.link')
	  .data(treeData.links())
	  .enter()
	  .append('line')
	  .attr('class', 'link')
	  .attr('x1', d => d.source.x)
	  .attr('y1', d => d.source.y)
	  .attr('x2', d => d.source.x)
	  .attr('y2', d => d.source.y)
	  .transition()
	  .duration(500)
	  .attr('x2', d => d.target.x)
	  .attr('y2', d => d.target.y)
	  .attr('stroke', 'black');
  
	const nodes = g
	  .selectAll('.node')
	  .data(treeData.descendants())
	  .enter()
	  .append('g')
	  .attr('class', 'node')
	  .attr('transform', d => `translate(${d.x},${d.y})`);
  
	nodes
	  .append('circle')
	  .attr('r', 0)
	  .attr('fill', '#fff')
	  .attr('stroke', 'black')
	  .transition()
	  .duration(500)
	  .attr('r', 20);
  
	nodes
	  .append('text')
	  .attr('dy', 5)
	  .attr('text-anchor', 'middle')
	  .style('opacity', 0)
	  .text(d => {
		// For leaf nodes, show both character and frequency
		if (!d.data.left && !d.data.right) {
		  return `${d.data.name} (${d.data.freq})`;
		}
		// For internal nodes, show only frequency
		return `${d.data.freq}`;
	  })
	  .transition()
	  .duration(500)
	  .style('opacity', 1);
  }
  
  // Reset function
  function reset() {
	// Clear input field
	document.getElementById('input-data').value = '';
	// Clear result sections
	document.getElementById('initial-nodes').innerText = 'Sorted input: ';
	document.getElementById('code-table').innerHTML = '';
	// Clear the tree container
	d3.select('svg').selectAll('*').remove();
  }
  