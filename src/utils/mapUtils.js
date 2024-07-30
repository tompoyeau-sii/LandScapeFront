import L from "leaflet";

// Import d'icones afin de définir les icones affichés sur la carte en fonction d'un point de départ, étapes ou arrivé 
import startIconUrl from "@/assets/img/start.png";
import endIconUrl from "@/assets/img/end.png";
import stepIconUrl from "@/assets/img/step.png";
import poiIconUrl from "@/assets/img/poi.png"

// En lui passant une map ainsi que des coordonnées en paramètre, cette méthode va créer un marker sur la carte
export function createMarker(map, location) {
    return L.marker([location.lat, location.lng], {
        icon: L.icon({
            iconUrl: stepIconUrl,
            iconRetinaUrl: stepIconUrl,
            iconSize: [41, 41],
            popupAnchor: [1, -34],
        }),
    }).addTo(map);
}

export function createPoiMarker(map, location) {
    return L.marker([location.lat, location.lng], {
        icon: L.icon({
            iconUrl: poiIconUrl,
            iconRetinaUrl: poiIconUrl,
            iconSize: [41, 41],
            popupAnchor: [1, -34],
        }),
    }).addTo(map);
}


// Permet de créer un itinéraire
export function createRouteControl(map, route) {
    // On défini la liste d'étapes à vide au début
    let waypoints = [];

    // Si l'itinéraire a des étapes intermédiaires
    if (route.waypoints) {
        waypoints = [
            L.latLng(route.coordinates[0]), // Point de départ
            ...route.waypoints.map((coord) => L.latLng(coord)), // Étapes intermédiaires
            L.latLng(route.coordinates[1]), // Point d'arrivée
        ];
    } else {
        // Sinon, on n'a que le point de départ et le point d'arrivée
        waypoints = [
            L.latLng(route.coordinates[0]), // Point de départ
            L.latLng(route.coordinates[1]), // Point d'arrivée
        ];
    }

    return L.Routing.control({
        waypoints: waypoints, // Liste des points de passage
        lineOptions: {
            styles: [{ color: "blue", opacity: 0.6, weight: 3 }], // Style de la ligne de l'itinéraire
        },
        createMarker: function (i, waypoint, n) {
            let iconUrl;
            if (i === 0) {
                iconUrl = startIconUrl; // URL de l'icône du point de départ
            } else if (i === n - 1) {
                iconUrl = endIconUrl; // URL de l'icône du point d'arrivée
            } else {
                iconUrl = stepIconUrl; // URL de l'icône des étapes intermédiaires
            }
            return L.marker(waypoint.latLng, {
                icon: L.icon({
                    iconUrl: iconUrl,
                    iconRetinaUrl: iconUrl,
                    iconSize: [41, 41],
                    popupAnchor: [1, -34], // Position de l'ancre du popup par rapport à l'icône
                }),
            });
        },
        router: L.Routing.osrmv1({
            language: "fr", // Langue des instructions
            serviceUrl: "https://router.project-osrm.org/route/v1", // URL du service de routage
        }),
    }).addTo(map); // Ajoute le contrôle de routage à la carte
}


// Fonction pour ajuster la vue de la carte pour inclure deux points donnés
export function fitMapToBounds(map, startPoint, endPoint) {
    // Vérifie si les deux points sont définis
    if (startPoint && endPoint) {
        const bounds = L.latLngBounds([startPoint, endPoint]);
        // Ajuste la vue de la carte pour inclure les bounds définies
        map.fitBounds(bounds);
    }
}

