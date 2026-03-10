let map;
let volcanoChart;


const API = "./volcanoes.json";

function initMap() {
    console.log("initMap is running");

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2
    });

    console.log("ABOUT TO FETCH");

    fetch(API)
        .then(res => {
            console.log("Fetch response status:", res.status);
            return res.json();
        })
        .then(data => {
            console.log("Raw volcano data:", data);
            console.log("DATA TYPE:", typeof data, Array.isArray(data));

            placeMarkers(data);
            drawChart(data);
        })
        .catch(err => {
            console.error("Failed to load volcano data:", err);
        });
}

function placeMarkers(data) {
    const volcanoes = data || [];

    console.log("Placing markers. Count:", volcanoes.length);

    volcanoes.forEach(v => {
        const lat = Number(v.latitude);
        const lng = Number(v.longitude);
        const name = v.name || "Unknown volcano";
        const elevation = Number(v.elevation);
        const country = v.country || "Unknown country";
        const region = v.region || "Unknown region";

        if (isNaN(lat) || isNaN(lng)) {
            return;
        }

        const marker = new google.maps.Marker({
            position: { lat, lng },
            map,
            title: name,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: Math.max(4, elevation / 500),
                fillColor: "#d62828",
                fillOpacity: 0.85,
                strokeColor: "#ffffff",
                strokeWeight: 1
            }
        });

        const info = new google.maps.InfoWindow({
            content: `
                <div>
                    <strong>${name}</strong><br/>
                    Country: ${country}<br/>
                    Region: ${region}<br/>
                    Elevation: ${elevation} m
                </div>
            `
        });

        marker.addListener("click", () => {
            info.open({
                map,
                marker,
                shouldFocus: false
            });
        });
    });
}

function drawChart(data) {
    const volcanoes = data || [];

    console.log("Preparing chart. Total volcanoes:", volcanoes.length);

    const sorted = [...volcanoes]
        .filter(v => !isNaN(Number(v.elevation)))
        .sort((a, b) => Number(b.elevation) - Number(a.elevation))
        .slice(0, 15);

    const labels = sorted.map(v => v.name || "Unknown");
    const elevations = sorted.map(v => Number(v.elevation));

    const colors = elevations.map(e => (e >= 3000 ? "red" : "orange"));

    if (volcanoChart) {
        volcanoChart.destroy();
    }

    const ctx = document.getElementById("volcanoChart");

    volcanoChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Elevation (m)",
                data: elevations,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "15 of the Tallest Volcanoes in the World"
                }
            },
            scales: {
                x: {
                    title: { display: true, text: "Elevation (meters)" },
                    beginAtZero: true
                },
                y: {
                    title: { display: true, text: "Volcano" }
                }
            }
        }
    });
}
