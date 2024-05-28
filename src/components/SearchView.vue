<template>
    <div>
        <div class="route-input">
            <label>
                <!-- Départ : -->
                <input v-model="from" placeholder="Ex: Paris, France" @change="updateRoute">
            </label>
            <label>
                <!-- Arrivée : -->
                <input v-model="to" placeholder="Ex: Louviers, France" @change="updateRoute">
            </label>
        </div>
        <l-map :zoom="zoom" :center="center" style="height: 100vh; width: 100%;"
            :options="{ zoomControl: true, dragging: true }">
            <l-tile-layer :url="googleStreetsUrl" :attribution="googleStreetsAttribution"
                :options="googleStreetsOptions"></l-tile-layer>
            <l-marker v-if="marker" :lat-lng="marker"></l-marker>
            <l-polyline v-if="route" :lat-lngs="route" color="red"></l-polyline>
        </l-map>
    </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline } from "@vue-leaflet/vue-leaflet";
import axios from 'axios';

export default {
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPolyline
    },
    data() {
        return {
            zoom: 8,
            center: [48.0061, 0.1996], // Coordonnées du Mans par défaut
            googleStreetsUrl: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            googleStreetsAttribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
            googleStreetsOptions: {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            },
            marker: null,
            route: null,
            from: '',
            to: ''
        };
    },
    methods: {
        async updateRoute() {
            if (this.from && this.to) {
                try {
                    const fromCoords = await this.getCoordinates(this.from);
                    const toCoords = await this.getCoordinates(this.to);
                    const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?geometries=geojson`);
                    const routeData = response.data.routes[0].geometry.coordinates;
                    this.route = routeData.map(coord => [coord[1], coord[0]]); // Inverser l'ordre des coordonnées pour Leaflet
                    this.center = this.route[0];
                } catch (error) {
                    console.error("Erreur lors de la récupération de l'itinéraire :", error);
                }
            }
        },
        async getCoordinates(location) {
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
                if (response.data && response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    return { lat: parseFloat(lat), lng: parseFloat(lon) };
                } else {
                    throw new Error('Lieu non trouvé');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des coordonnées :", error);
                throw error;
            }
        }
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.custom-font {
    font-family: 'Roboto', sans-serif;
}

.leaflet-container {
    z-index: 1;
    height: 100vh;
    width: 100%;
}

.route-input {
    position: absolute;
    top: 10px;
    left: 10px;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.route-input label {
    display: block;
    margin-bottom: 5px;
}

.route-input input {
    width: 200px;
    padding: 5px;
    margin-bottom: 10px;
}
</style>
