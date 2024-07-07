
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
        endColor: { r: 107, g: 142, b: 35 }
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
        fetch('website/data/my_benchmark.json').then(response => response.json()),
        // Add other fetch calls if necessary
    ])
    .then(([my_benchmark_data]) => {
        // Process your benchmark data as needed
        my_benchmark_data.forEach(row => {
            row.line = [
                row['alignment_avg_with_tie'],
                row['alignment_avg_without_tie'],
                row['safety_avg_with_tie'],
                row['safety_avg_without_tie'],
                row['artifact_avg_with_tie'],
                row['artifact_avg_without_tie'],
                row['bias_acc'],
                row['bias_nds'],
                row['bias_ges']
            ];
        });

        var table = new Tabulator("#benchmark-table", {
            data: my_benchmark_data,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            movableColumns: false,
            initialSort: [
                { column: "alignment_avg_without_tie", dir: "desc" },
            ],
            columnDefaults: {
                tooltip: true,
            },
            columns: [
                { title: "Model", field: "model", widthGrow: 1.5, minWidth: 180 },
                { title: "Alignment Avg w/ Tie", field: "alignment_avg_with_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Alignment Avg w/o Tie", field: "alignment_avg_without_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Safety Avg w/ Tie", field: "safety_avg_with_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Safety Avg w/o Tie", field: "safety_avg_without_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Artifact Avg w/ Tie", field: "artifact_avg_with_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Artifact Avg w/o Tie", field: "artifact_avg_without_tie", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Bias ACC", field: "bias_acc", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Bias NDS", field: "bias_nds", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
                { title: "Bias GES", field: "bias_ges", hozAlign: "center", formatter: colorFormatter, minWidth: 90 },
            ],
        });
    });
});