let map;

$(document).ready(function () {
    mapboxgl.accessToken =
        "pk.eyJ1IjoiZmFqcmlzcnkwOSIsImEiOiJjbDh5OTlzOWkwNjNnM3dxcHlsMXV1am5iIn0.d9ZyWyiMTO-NtcCJqx60fg";
    map = new mapboxgl.Map({
        container: "map",
        center: [-122.420679, 37.772537],
        zoom: 13,
        style: "mapbox://styles/mapbox/streets-v11",
        hash: true,
        transformRequest: (url, resourceType) => {
            if (resourceType === "Source" && url.startsWith("http://myHost")) {
                return {
                    url: url.replace("http", "https"),
                    headers: { "my-custom-header": true },
                    credentials: "include",
                };
            }
        },
    });

    const nav = new mapboxgl.NavigationControl({
        visualizePitch: true,
    });
    map.addControl(nav, "bottom-right");

    get_restaurants();

    let initials = [
        [-64.17166598, 28.334665328],
        [-62.17166598, 28.334665328],
        [-60.17166598, 28.334665328],

        [-64.17166598, 26.334665328],
        [-64.17166598, 24.334665328],
        [-64.17166598, 22.334665328],
        [-64.17166598, 20.334665328],

        [-62.17166598, 24.334665328],
        [-60.17166598, 24.334665328],
    ];

    for (let i = 0; i < initials.length; i++) {
        new mapboxgl.Marker().setLngLat(initials[i]).addTo(map);
    }
});

function create_restaurant() {
    let name = $('#input-name').val();
    let categories = $('#input-categories').val();
    let location = $('#input-location').val();
    let longitude = $('#input-longitude').val();
    let latitude = $('#input-latitude').val();

    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);

    $.ajax({
        type: 'POST',
        url: '/restaurant/create',
        data: {
            name: name,
            categories: categories,
            location: location,
            longitude: longitude,
            latitude: latitude,
        },
        success: function (response) {
            if (response.result === 'success') {
                alert(response.msg);
                window.location.reload();
            } else {
                alert('Something went wrong');
            }
        }
    });
}

function delete_restaurant(name) {
    $.ajax({
        type: 'POST',
        url: '/restaurant/delete',
        data: {
            name: name,
        },
        success: function (response) {
            if (response.result === 'success') {
                alert(response.msg);
                window.location.reload();
            } else {
                alert('Something went wrong');
            }
        }
    });
}

function make_card(i, restaurant) {
    let html_temp = `<div class="card" id="card-${i}" onclick="map.flyTo({center: [${restaurant.center}]});">
                  <div class="card-body">
                      <h5 class="card-title"><a href="${restaurant.link}" class="restaurant-title">${restaurant.name}</a></h5>
                      <h6 class="card-subtitle mb-2 text-muted">${restaurant.categories}</h6>
                      <p class="card-text">${restaurant.location}</p>
                      <button class="btn btn-danger" onclick="delete_restaurant('${restaurant.name}');">Delete</button>
                  </div>
               </div>`;
    $("#restaurant-box").append(html_temp);
}

function get_restaurants() {
    $("#restaurant-box").empty();
    $.ajax({
        type: "GET",
        url: "/restaurants",
        data: {},
        success: function (response) {
            let restaurants = response["restaurants"];
            for (let i = 0; i < restaurants.length; i++) {
                let restaurant = restaurants[i];
                console.log(restaurant);
                make_card(i, restaurant);
                make_marker(restaurant);
                add_info(i, restaurant);
            }
        },
    });
}

function make_marker(restaurant) {
    new mapboxgl.Marker().setLngLat(restaurant.center).addTo(map);
}

function scroll_to_card(i) {
    $("#restaurant-box").animate(
        {
            scrollTop:
                $("#restaurant-box").get(0).scrollTop +
                $(`#card-${i}`).position().top,
        },
        1000
    );
}

function add_info(i, restaurant) {
    new mapboxgl.Popup({
        offset: {
            bottom: [0, -35],
        },
    })
        .setLngLat(restaurant.center)
        .setHTML(
            `<div class="iw-inner" onclick="map.flyTo({center: [${restaurant.center}]}); scroll_to_card(${i});">
                  <h5>${restaurant.name}</h5>
                  <p>${restaurant.location}
                  </div>`
        )
        .setMaxWidth("300px")
        .addTo(map);
}