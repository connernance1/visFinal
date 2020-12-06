class LineChart {
    /**
     * Constructor for the Line Chart
     * @param type: the type of the chart
     * @param allYears: optional parameter that contains the data for all the years
     */
    constructor(type,allYears = null){
        this.chart = d3.select(`#${type}-line-chart`).classed("sideBar",true);
        this.type = type;
        this.allYears = allYears
        // set the dimensions and margins of the graph
        this.margin = {top: 10, right: 30, bottom: 20, left: 40},

        this.svgBounds = this.chart.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 300;

        this.svg = this.chart.append('svg')
            .attr('width',this.svgWidth).attr('height',this.svgHeight)
    }

    update(data,years,init = false,curSt = 'UT'){
        this.svg.selectAll("*").remove();
        let avg = [];
        let mapping;
        if (!init){
            if (this.type === 'st'){
                for (let t in this.allYears){
                    let tmp = this.allYears[t].filter(d => d.STABBR === curSt && d.C150_4 !== "NULL")
                    let s = d3.sum(tmp.map(d => {return d.C150_4}))
                    avg.push( ((s / tmp.length)*100).toFixed(2) )
                }
                mapping = avg.map((a,i) => {return {avg:parseFloat(a),yr:years[i]}})
                // console.log(mapping)
                console.log(curSt,d3.max(mapping,d => d.avg),d3.min(mapping,d => d.avg))
            }
        }
        else {
            mapping = data.map((a,i) => {return {avg:parseFloat(a),yr:years[i]}})
        }
        // console.log(mapping)

        // Code to determine min/max of each state, then min/max of all those together
        let minmax = {
            States: {
                "02": "AK",
                "01": "AL",
                "05": "AR",
                "04": 'AZ',
                "06": 'CA',
                "08": 'CO',
                "09": 'CT',
                "10": 'DE',
                "12": 'FL',
                "13": 'GA',
                "15": 'HI',
                "19": 'IA',
                "16": 'ID',
                "17": 'IL',
                "18": 'IN',
                "20": 'KS',
                "21": 'KY',
                "22": 'LA',
                "25": 'MA',
                "24": 'MD',
                "23": 'ME',
                "26": 'MI',
                "27": 'MN',
                "29": 'MO',
                "28": 'MS',
                "30": 'MT',
                "37": 'NC',
                "38": 'ND',
                "31": 'NE',
                "33": 'NH',
                "34": 'NJ',
                "35": 'NM',
                "32": 'NV',
                "36": 'NY',
                "39": 'OH',
                "40": 'OK',
                "41": 'OR',
                "42": 'PA',
                "44": 'RI',
                "45": 'SC',
                "46": 'SD',
                "47": 'TN',
                "48": 'TX',
                "49": 'UT',
                "51": 'VA',
                "50": 'VT',
                "53": 'WA',
                "55": 'WI',
                "54": 'WV',
                "56": 'WY'
            },
            totals: [],
            boundes: [],
            bavg: [],
            compute: function(stuff) {
                for (let state in this.States){
                    for (let t in stuff){
                        let tmp = stuff[t].filter(d => d.STABBR === this.States[state] && d.C150_4 !== "NULL")
                        let s = d3.sum(tmp.map(d => {return d.C150_4}))
                        this.bavg.push( ((s / tmp.length)*100).toFixed(2) )
                    }
                    this.boundes = this.bavg.map((a,i) => {return {avg:parseFloat(a),yr:years[i]}})
                    this.bavg = []
                    if (this.States[state] == 'UT') console.log(this.boundes)
                    this.totals.push( {abr:this.States[state],max:d3.max(this.boundes,d => d.avg),min:d3.min(this.boundes,d => d.avg)} )
                    // console.log(d3.max(this.boundes,d => d.avg),d3.min(this.boundes,d => d.avg))
                    this.boundes = []
                }
                console.log(this.totals.filter(t => t.abr == 'UT'))
                console.log(d3.max(this.totals,d => d.max),d3.min(this.totals,d => d.min))
            }
        }
        if (this.type === 'st') minmax.compute(this.allYears)
        

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain(d3.extent(mapping, d => d.yr))
            .range([ 0, this.svgWidth- this.margin.left - this.margin.right ]);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.svgHeight-this.margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')));

        // Add Y axis
        // ymax = 73.29 ymin = 16.62
        var y = d3.scaleLinear()
            .domain([0, d3.max(mapping, d => d.avg)])
            .range([ this.svgHeight-this.margin.bottom, this.margin.top ]);
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(y));

        // Add the line
        this.svg.append("path")
            .datum(mapping)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
            .x(d => x(d.yr)+this.margin.left)
            .y(d => y(d.avg))
            )
    }
}