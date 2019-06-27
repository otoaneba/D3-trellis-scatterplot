// **** Your JavaScript code goes here ****

var svg = d3.select('svg');

var svgW = +svg.attr('width');
var svgH = +svg.attr('height');

var padding = {t: 10, r: 10, b: 50, l: 50};

scatterWidth = svgW / 2 - padding.l - padding.r;
scatterHeight = svgH / 2 - padding.t - padding.b;

svg.selectAll('.background')
    .data(['A', 'B', 'C', 'D']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', scatterWidth) // Use our trellis dimensions
    .attr('height', scatterHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (scatterWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (scatterHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

d3.csv('./data/real_estate.csv', function(error, dataset) {
	console.log('data import complete');
	console.log(dataset)

	var rsData = d3.nest()
		.key(function(d) { return d.location })
		.entries(dataset);
	console.log('rsData', rsData);

	var scatterG = svg.selectAll('.scatter')
	    .data(rsData)
	    .enter()
	    .append('g')
	    .attr('class', 'scatter')
	    .attr('transform', function(d, i){
	        var tx = (i % 2) * (scatterWidth + padding.l + padding.r) + padding.l;
	        var ty = Math.floor(i / 2) * (scatterHeight + padding.t + padding.b) + padding.t;

	        return 'translate('+[tx, ty]+')';
	});

	scatterG.selectAll('.circle')
	    .data(function(d) {
	    	return d.values;
	    })
	    .enter()
	    .append('circle')
	    .attr('class', function(b) {
	    	if(b.beds <= 2) {
	    		return 'less';
	    	} else {
	    		return 'more';
	    	}
	    })
	    .attr('transform', function(d){
	        return 'translate('+scaleYear(d.year_built) + ',' +scalePrice(d.price_per_sqft) + ')';
	    })
		.attr('r', 2);

	var xAxis = d3.axisBottom(yearScale.range([0, 290]))
		.tickFormat(function(d) {
		if(d % 20 == 0) {
			return d;
		}
	});

	var yAxis = d3.axisLeft(priceScale.range([290, 0]))
		.tickFormat(function(d) {
			if((d / 1000) >= 1) {
				d = d / 1000 + 'k';
			}
			return d;
		});

	scatterG.append('g')
    	.attr("class", "xaxis")
    	.call(xAxis)
    	.attr("transform","translate(0, 290)");

	scatterG.append('g')
    	.attr('class', 'yaxis')
    	.call(yAxis)
    	.attr('transform','translate(0, 0)');

    scatterG.append('text')
    	.attr('class', 'scatterLabel')
    	.attr('transform', 'translate('+[(scatterWidth / 2) - 40, scatterHeight / 8]+')')
    	.text(function(d) { return d.key});

    scatterG.append('text')
    	.attr('class', 'yLabel')
    	.attr('transform', 'translate( -35, 230 )rotate(-90)')
    	.text(function(d) { return 'Price per Square Foot (USD)'});

    scatterG.append('text')
    	.attr('class', 'xLabel')
    	.attr('transform', 'translate(120, 320 )')
    	.text(function(d) { return 'Year Built'});


});

// **** Functions to call for scaled values ****
function scaleYear(year) {
    return yearScale(year);
}

function scalePrice(price) {
    return priceScale(price);
}

// **** Code for creating scales, axes and labels ****
var yearScale = d3.scaleLinear()
	.domain([1875, 2016]).range([0,290]);

var priceScale = d3.scaleLinear()
	.domain([94, 4601]).range([290,0]);
