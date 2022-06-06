const mapZoom = 15;
const searchRadius = 5000;

let service: google.maps.places.PlacesService;

async function getGeoLocation(): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      resolve(position);
    });
  });
}

async function getNearByRestaurants(
  map: google.maps.Map
): Promise<google.maps.places.PlaceResult[]> {
  const center = map.getCenter();

  return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
    service.nearbySearch(
      {
        type: 'restaurant',
        location: { lat: center.lat(), lng: center.lng() },
        radius: searchRadius, // in meters
        rankBy: google.maps.places.RankBy.PROMINENCE,
      },
      (
        results: google.maps.places.PlaceResult[],
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination
      ) => {
        if (status !== 'OK') {
          alert('Cannot get the place results!');
          reject();
          return;
        }
        console.log({ results, status, pagination });
        resolve(results);
      }
    );
  });
}

function randomPick(
  restaurants: google.maps.places.PlaceResult[]
): google.maps.places.PlaceResult {
  const random = Math.floor(Math.random() * restaurants.length);
  return restaurants[random];
}

async function getDetails(
  place: google.maps.places.PlaceResult
): Promise<google.maps.places.PlaceResult> {
  return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
    service.getDetails(
      {
        placeId: place.place_id!,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'photos',
          'rating',          
          'geometry',
        ],
      },
      (place, status) => {
        if (status !== 'OK') {
          reject();
          return;
        }
        console.log({ place });
        resolve(place);
      }
    );
  });
}

function createMarker(
  map: google.maps.Map,
  place: google.maps.places.PlaceResult
) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  const infoWindow = new google.maps.InfoWindow();

  google.maps.event.addListener(marker, 'click', () => {
    const content = document.createElement('div');

    const nameElement = document.createElement('h2');
    nameElement.innerHTML = `${place.name!} (⭐${place.rating!})`;
    content.appendChild(nameElement);

    const placeIdElement = document.createElement('p');
    placeIdElement.textContent = place.formatted_phone_number!;
    content.appendChild(placeIdElement);

    const placeAddressElement = document.createElement('p');
    placeAddressElement.textContent = place.formatted_address!;
    content.appendChild(placeAddressElement);

    if (place.photos!.length > 0) {
      const photoElement = document.createElement('img');
      photoElement.src = place.photos![0].getUrl({ maxWidth: 300 });
      content.appendChild(photoElement);
    }

    infoWindow.setContent(content);
    infoWindow.open(map, marker);
  });
}

async function initMap(): Promise<void> {
  const position = await getGeoLocation();
  const { latitude, longitude } = position.coords;

  const map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      center: { lat: latitude, lng: longitude },
      zoom: mapZoom,
    }
  );
  service = new google.maps.places.PlacesService(map);

  const restaurants = await getNearByRestaurants(map);
  const target = randomPick(restaurants);
  const details = await getDetails(target);
  createMarker(map, details);
}

declare global {
  interface Window {
    initMap: () => Promise<void>;
  }
}
window.initMap = initMap;
export {};
