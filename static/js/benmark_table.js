
//Formatter to generate charts
var chartFormatter = function (cell, formatterParams, onRendered) {
    var content = document.createElement("span");
    var values = cell.getValue();

    //invert values if needed
    if (formatterParams.invert) {
        values = values.map(val => val * -1);
    }

    //add values to chart and style
    content.classList.add(formatterParams.type);
    content.inneHrTML = values.join(",");

    //setup chart options
    var options = {
        width: 50,
        // min: 0.0,
        // max: 100.0,
    }

    if (formatterParams.fill) {
        options.fill = formatterParams.fill
    }

    //instantiate piety chart after the cell element has been aded to the DOM
    onRendered(function () {
        peity(content, formatterParams.type, options);
    });

    return content;
};



var colorFormatter = function (cell, formatterParams) {
    var value = cell.getValue();

    // Check for the specific string "-"
    if (value === "-") {
        return value;
    }

    // Default values
    var defaults = {
        min: 0.0,
        max: 100.0,
        startColor: { r: 255, g: 255, b: 255 },
        endColor: { r: 100, g: 150, b: 250 }
    };

    // Override defaults with provided formatterParams values
    var min = (formatterParams && formatterParams.min) || defaults.min;
    var max = (formatterParams && formatterParams.max) || defaults.max;
    var startColor = (formatterParams && formatterParams.startColor) || defaults.startColor;
    var endColor = (formatterParams && formatterParams.endColor) || defaults.endColor;

    // Normalize the value between 0 and 1
    var normalizedValue = (value - min) / (max - min);

    // Compute the color gradient 
    var red = Math.floor(startColor.r + (endColor.r - startColor.r) * normalizedValue);
    var green = Math.floor(startColor.g + (endColor.g - startColor.g) * normalizedValue);
    var blue = Math.floor(startColor.b + (endColor.b - startColor.b) * normalizedValue);

    // make sure the value is rounded to 1 decimal place
    value = parseFloat(value).toFixed(1)

    return "<span style='display: block; width: 100%; height: 100%; background-color: rgb(" + red + ", " + green + ", " + blue + ");'>" + value + "</span>";
}


var barColorFn = function (value, formatterParams) {
    var defaults = {
        range: [-50, 50],
        low: { r: 255, g: 100, b: 150 },
        high: { r: 150, g: 255, b: 150 }
    };

    // Override defaults with provided formatterParams values

    var low_range = (formatterParams && formatterParams.range[0]) || defaults.range[0];
    var high_range = (formatterParams && formatterParams.range[1]) || defaults.range[1];
    var low = (formatterParams && formatterParams.low) || defaults.low;
    var high = (formatterParams && formatterParams.high) || defaults.high;

    // Clamp the value to the range [-100, 100]
    value = Math.max(low_range, Math.min(high_range, value));
    var range = high_range - low_range;

    // Normalize the value to the range [0, 1]
    var normalizedValue = (value + range / 2) / range;
    // Interpolate between the two colors based on the normalized value
    var interpolated = {
        r: Math.floor(low.r + (high.r - low.r) * normalizedValue),
        g: Math.floor(low.g + (high.g - low.g) * normalizedValue),
        b: Math.floor(low.b + (high.b - low.b) * normalizedValue)
    };

    return 'rgba(' + interpolated.r + ',' + interpolated.g + ',' + interpolated.b + ',0.9)';
}

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        fetch('static/data/benchmark.json').then(response => response.json()),
        fetch('static/data/human_eval.json').then(response => response.json()),
        fetch('static/data/alignment.json').then(response => response.json()),
        fetch('static/data/safety.json').then(response => response.json()),
        fetch('static/data/quality.json').then(response => response.json()),
        fetch('static/data/bias.json').then(response => response.json()),
    ])
        .then(([
            benchmark_tabledata,
            human_tabledata,
            alignment_tabledata,
            safety_tabledata,
            quality_tabledata,
            bias_tabledata]) => {

            // 1. Benchmark Table
            benchmark_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var table = new Tabulator("#benchmark-table", {
                data: benchmark_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 135 },
                    {
                        title: "Alignment",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Avg w/ tie", field: "Alignment_Avg_w_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 118, formatter: colorFormatter },
                            { title: "Avg w/o tie", field: "Alignment_Avg_w_o_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 130, formatter: colorFormatter },
                        ],
                    },
                    {
                        title: "Safety",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Avg w/ tie", field: "Safety_Avg_w_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 118, formatter: colorFormatter },
                            { title: "Avg w/o tie", field: "Safety_Avg_w_o_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 130, formatter: colorFormatter },
                        ],
                    },
                    {
                        title: "Quality",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Avg w/ tie", field: "Artifact_Avg_w_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 118, formatter: colorFormatter },
                            { title: "Avg w/o tie", field: "Artifact_Avg_w_o_tie", headerHozAlign: "center", hozAlign: "center", minWidth: 130, formatter: colorFormatter },
                        ],
                    },
                    {
                        title: "Bias",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ACC", field: "Bias_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 82, formatter: colorFormatter },
                            { title: "NDS", field: "Bias_NDS", headerHozAlign: "center", hozAlign: "center", minWidth: 82, formatter: colorFormatter },
                            { title: "GES", field: "Bias_GES", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                        ],
                    },
                    { title: "Overall", field: "Overall_Score", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 114, formatter: colorFormatter },
                ],
                initialSort: [
                    { column: "Overall_Score", dir: "desc" },
                ],
            });

            // 2. Human Evaluation Table
            human_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var human_eval_table = new Tabulator("#human-table", {
                data: human_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 150 },
                    {
                        title: "Alignment",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Alignment_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Alignment_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Alignment_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Alignment_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Safety",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Safety_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Safety_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Safety_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Safety_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Bias",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "FR", field: "Bias_FR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "RR", field: "Bias_RR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AR", field: "Bias_AR", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter },
                            { title: "AV", field: "Bias_AV", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 70, formatter: colorFormatter }
                        ]
                    }
                ],
                initialSort: [
                    { column: "Alignment_AR", dir: "asc" },
                    { column: "Safety_AR", dir: "asc" },
                    { column: "Bias_AR", dir: "asc" }
                ],
            });

            // 3. Alignment Table
            alignment_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var alignment_table = new Tabulator("#alignment-table", {
                data: alignment_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 180 },
                    { title: "Object", field: "Object", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Attribute", field: "Attribute", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Action", field: "Action", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Location", field: "Location", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Count", field: "Count", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                    { title: "Avg", field: "Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                ],
                initialSort: [
                    { column: "Avg", dir: "desc" },
                ],
            });

            // 4. Safety Table
            safety_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var safety_table = new Tabulator("#safety-table", {
                data: safety_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 150 },
                    {
                        title: "Toxicity",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Crime", field: "Toxicity_Crime", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Shocking", field: "Toxicity_Shocking", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                            { title: "Disgust", field: "Toxicity_Disgust", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Avg", field: "Toxicity_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "NSFW",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Evident", field: "NSFW_Evident", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Evasive", field: "NSFW_Evasive", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Subtle", field: "NSFW_Subtle", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter },
                            { title: "Avg", field: "NSFW_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                        ]
                    },
                    { title: "Avg", field: "Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                ],
                initialSort: [
                    { column: "Avg", dir: "desc" },
                ],
            });

            // 5. Quality Table
            quality_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var quality_table = new Tabulator("#quality-table", {
                data: quality_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 180 },
                    {
                        title: "Distortion",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Human Face", field: "Distortion_Human_Face", headerHozAlign: "center", hozAlign: "center", minWidth: 150, formatter: colorFormatter },
                            { title: "Human Limb", field: "Distortion_Human_Limb", headerHozAlign: "center", hozAlign: "center", minWidth: 150, formatter: colorFormatter },
                            { title: "Object", field: "Distortion_Object", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                            { title: "Avg", field: "Distortion_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Blurry",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "Defocused", field: "Blurry_Defocused", headerHozAlign: "center", hozAlign: "center", minWidth: 130, formatter: colorFormatter },
                            { title: "Motion", field: "Blurry_Motion", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter },
                            { title: "Avg", field: "Blurry_Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter }
                        ]
                    },
                    { title: "Avg", field: "Avg", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 120, formatter: colorFormatter }
                ],
                initialSort: [
                    { column: "Avg", dir: "desc" },
                ],
            });

            // 6. Bias Table
            bias_tabledata.forEach(row => {
                row.line = [row['1'], row['2'], row['3'], row['4'], row['5'], row['6']]
            })

            var bias_table = new Tabulator("#bias-table", {
                data: bias_tabledata,
                layout: "fitColumns",
                responsiveLayout: "collapse",
                movableColumns: false,
                columnDefaults: {
                    tooltip: true,
                },
                columns: [
                    { title: "Model", field: "Model", headerHozAlign: "center", headerVAlign: "middle", widthGrow: 2.0, minWidth: 150 },
                    {
                        title: "Numerical [0-5]",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ACC", field: "Numerical_0_5_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "NDS", field: "Numerical_0_5_NDS", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "GES", field: "Numerical_0_5_GES", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Numerical [0-10]",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ACC", field: "Numerical_0_10_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "NDS", field: "Numerical_0_10_NDS", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "GES", field: "Numerical_0_10_GES", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter }
                        ]
                    },
                    {
                        title: "Likert scale",
                        headerHozAlign: "center",
                        headerVAlign: "middle",
                        columns: [
                            { title: "ACC", field: "Likert_ACC", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "NDS", field: "Likert_NDS", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter },
                            { title: "GES", field: "Likert_GES", headerHozAlign: "center", hozAlign: "center", minWidth: 80, formatter: colorFormatter }
                        ]
                    },
                    { title: "Overall", field: "Overall", sorter: "number", headerHozAlign: "center", hozAlign: "center", minWidth: 90, formatter: colorFormatter }
                ],
                initialSort: [
                    { column: "Overall", dir: "desc" },
                ],
            });


        });

})