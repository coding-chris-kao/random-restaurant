"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mapZoom = 10;
const searchRadius = 5000;
let service;
function getGeoLocation() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            });
        });
    });
}
function getNearByRestaurants(map) {
    return __awaiter(this, void 0, void 0, function* () {
        const center = map.getCenter();
        return new Promise((resolve, reject) => {
            service.nearbySearch({
                type: 'restaurant',
                location: { lat: center.lat(), lng: center.lng() },
                radius: searchRadius,
                rankBy: google.maps.places.RankBy.PROMINENCE,
            }, (results, status, pagination) => {
                if (status !== 'OK') {
                    alert('Cannot get the place results!');
                    reject();
                    return;
                }
                console.log({ results, status, pagination });
                resolve(results);
            });
        });
    });
}
function randomPick(restaurants) {
    const random = Math.floor(Math.random() * restaurants.length);
    return restaurants[random];
}
function getDetails(place) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            service.getDetails({
                placeId: place.place_id,
                fields: [
                    'name',
                    'formatted_address',
                    'formatted_phone_number',
                    'photos',
                    'rating',
                    'geometry',
                ],
            }, (place, status) => {
                if (status !== 'OK') {
                    reject();
                    return;
                }
                console.log({ place });
                resolve(place);
            });
        });
    });
}
function createMarker(map, place) {
    if (!place.geometry || !place.geometry.location)
        return;
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });
    const infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', () => {
        const content = document.createElement('div');
        const nameElement = document.createElement('h2');
        nameElement.innerHTML = `${place.name} (⭐${place.rating})`;
        content.appendChild(nameElement);
        const placeIdElement = document.createElement('p');
        placeIdElement.textContent = place.formatted_phone_number;
        content.appendChild(placeIdElement);
        const placeAddressElement = document.createElement('p');
        placeAddressElement.textContent = place.formatted_address;
        content.appendChild(placeAddressElement);
        if (place.photos.length > 0) {
            const photoElement = document.createElement('img');
            photoElement.src = place.photos[0].getUrl({ maxWidth: 300 });
            content.appendChild(photoElement);
        }
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
    });
}
function initMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const position = yield getGeoLocation();
        const { latitude, longitude } = position.coords;
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: latitude, lng: longitude },
            zoom: mapZoom,
        });
        service = new google.maps.places.PlacesService(map);
        new google.maps.Marker({
            map,
            label: 'You',
            position: { lat: latitude, lng: longitude },
        });
        const restaurants = yield getNearByRestaurants(map);
        const target = randomPick(restaurants);
        const details = yield getDetails(target);
        createMarker(map, details);
    });
}
window.initMap = initMap;
