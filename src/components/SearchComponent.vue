<template>
    <div>
        <form>
            <div class="input-container">
                <label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-marker-alt" @click="useCurrentLocation('from')"></i>
                        <input class="input-start" v-model="from" placeholder="Départ" @input="searchFromOptions" />
                    </div>
                    <div class="town-list" v-if="fromOptions.length">
                        <p class="list-element" v-for="option in fromOptions" :key="option.place_id" @click="selectFromOption(option)">
                            {{ option.display_name }}
                        </p>
                    </div>
                </label>
                <div v-for="(waypoint, index) in waypoints" :key="index" class="input-wrapper" :class="{ dragging: dragIndex === index }" @mousedown="startDrag($event, index)">
                    <label>
                        <div class="input-wrapper">
                            <i class="fas fa-map-marker-alt"></i>
                            <input class="input-waypoint" v-model="waypoint.location" placeholder="Ajouter une étape" @input="searchWaypointOptions(index)" />
                        </div>
                        <div class="town-list" v-if="waypoint.options.length">
                            <p class="list-element" v-for="option in waypoint.options" :key="option.place_id" @click="selectWaypointOption(index, option)">
                                {{ option.display_name }}
                            </p>
                        </div>
                    </label>
                </div>
                <label>
                    <div class="input-wrapper">
                        <i class="fas fa-map-marker-alt"></i>
                        <input class="input-end" v-model="to" placeholder="Destination" @input="searchToOptions" />
                    </div>
                    <div class="town-list" v-if="toOptions.length">
                        <p class="list-element" v-for="option in toOptions" :key="option.place_id" @click="selectToOption(option)">
                            {{ option.display_name }}
                        </p>
                    </div>
                </label>
            </div>
            <button type="button" @click="addWaypoint">Ajouter une étape</button>
        </form>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            from: "",
            fromCity: "",
            fromLatitude: 0,
            fromLongitude: 0,
            to: "",
            fromOptions: [],
            toOptions: [],
            waypoints: [],
            route: [],
            dragging: false,
            dragIndex: null,
            dragOverIndex: null,
            dragStartY: 0,
        };
    },
    methods: {
        async searchFromOptions() {
            if (this.from.length < 3) {
                this.fromOptions = [];
                return;
            }
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${this.from}`
                );
                this.fromOptions = response.data;
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des suggestions pour le départ :",
                    error
                );
            }
        },
        async searchToOptions() {
            if (this.to.length < 3) {
                this.toOptions = [];
                return;
            }
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${this.to}`
                );
                this.toOptions = response.data;
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des suggestions pour l'arrivée :",
                    error
                );
            }
        },
        addWaypoint() {
            this.waypoints.push({ location: "", options: [] });
        },
        async searchWaypointOptions(index) {
            const waypoint = this.waypoints[index];
            if (waypoint.location.length < 3) {
                waypoint.options = [];
                return;
            }
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${waypoint.location}`
                );
                this.waypoints[index].options = response.data;
            } catch (error) {
                console.error(
                    `Erreur lors de la récupération des suggestions pour l'étape ${index + 1} :`,
                    error
                );
            }
        },
        selectFromOption(option) {
            this.from = option.display_name;
            this.fromOptions = [];
            this.fromCity = option.display_name; // Ajout de cette ligne
            this.fromLatitude = parseFloat(option.lat); // Ajout de cette ligne
            this.fromLongitude = parseFloat(option.lon); // Ajout de cette ligne
            this.updateRoute();
        },
        selectWaypointOption(index, option) {
            this.waypoints[index].location = option.display_name;
            this.waypoints[index].options = [];
            this.updateRoute();
        },
        selectToOption(option) {
            this.to = option.display_name;
            this.toOptions = [];
            this.updateRoute();
        },
        async updateRoute() {
            try {
                let fromCoords;
                if (this.fromCity) {
                    fromCoords = { lat: this.fromLatitude, lng: this.fromLongitude };
                } else {
                    const position = await this.getCurrentPosition();
                    fromCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                }

                const toCoords = await this.getCoordinates(this.to);

                this.route = {
                    coordinates: [
                        [fromCoords.lat, fromCoords.lng],
                        [toCoords.lat, toCoords.lng],
                    ],
                    waypoints: [],
                };

                for (let waypoint of this.waypoints) {
                    if (waypoint.location) {
                        const waypointCoords = await this.getCoordinates(waypoint.location);
                        this.route.waypoints.push([waypointCoords.lat, waypointCoords.lng]);
                    }
                }

                console.log("valeur de l'itinéraire", this.route);
                this.$emit("selectRoute", this.route);
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération de l'itinéraire :",
                    error
                );
            }
        },
        async getCoordinates(location) {
            try {
                const response = await axios.get(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
                );
                if (response.data && response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    return { lat: parseFloat(lat), lng: parseFloat(lon) };
                } else {
                    throw new Error("Lieu non trouvé");
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des coordonnées :",
                    error
                );
                throw error;
            }
        },
        startDrag(event, index) {
            this.dragging = true;
            this.dragIndex = index;
            this.dragStartY = event.clientY;
            document.addEventListener("mousemove", this.onDrag);
            document.addEventListener("mouseup", this.endDrag);
        },
        onDrag(event) {
            if (!this.dragging) return;

            const dragOverElement = document.elementFromPoint(event.clientX, event.clientY);
            const newDragOverIndex = [...dragOverElement.parentElement.children].indexOf(dragOverElement);
            if (newDragOverIndex !== this.dragOverIndex) {
                this.dragOverIndex = newDragOverIndex;
                const draggedItem = this.waypoints.splice(this.dragIndex, 1)[0];
                this.waypoints.splice(this.dragOverIndex, 0, draggedItem);
                this.dragIndex = this.dragOverIndex;
            }
        },
        endDrag() {
            this.dragging = false;
            this.dragIndex = null;
            this.dragOverIndex = null;
            document.removeEventListener("mousemove", this.onDrag);
            document.removeEventListener("mouseup", this.endDrag);
            this.updateRoute();
        },
        async useCurrentLocation(field) {
            try {
                const position = await this.getCurrentPosition();
                const locationData = await this.getLocationData(position.coords.latitude, position.coords.longitude);
                this[field + 'City'] = locationData.city;
                this[field + 'Latitude'] = position.coords.latitude;
                this[field + 'Longitude'] = position.coords.longitude;
                this[field] = locationData.city;
                this.updateRoute();
            } catch (error) {
                console.error("Erreur de géolocalisation :", error);
            }
        },
        getCurrentPosition() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
        },
        async getLocationData(lat, lng) {
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
                console.log(response.data.address)
                return {
                    city: response.data.address.road ? `${response.data.address.city}, ${response.data.address.road}` : response.data.address.city,

                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng)
                };
            } catch (error) {
                console.error("Erreur lors de la récupération des données de localisation :", error);
                throw error;
            }
        },
    },
};
</script>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.input-container {
    display: flex;
    align-items: baseline;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: stretch;
}

.input-wrapper {
    display: flex;
    z-index: 10;
    align-items: center;
    position: relative;
}

.town-list {
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.list-element {
    padding: 10px;
    cursor: pointer;
    border: none;
}

.list-element:hover {
    background-color: #f0f0f0;
    text-decoration: underline;
}

label {
    display: flex;
    background-color: white;
    padding: 1vh;
    border-radius: 25px;
    align-items: stretch;
    margin: 10px;
    border: 1px solid black;
    flex-direction: column;
    width: 100%;
}

label i {
    margin-right: 5px;
}

.input-start,
.input-end,
.input-waypoint {
    border: none;
    font-size: large;
    padding: 5px;
    transition: width 0.3s;
}

.input-start:focus,
.input-end:focus,
.input-waypoint:focus {
    outline: none;
}

.waypoint {
    cursor: move;
    user-select: none;
}

.dragging {
    background-color: #f0f0f0;
}

button {
    background-color: #333;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #555;
}
</style>
