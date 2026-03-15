// Local Cache Service using IndexedDB
// Handles persistent storage of large city data objects in the browser to avoid Supabase limits.

const DB_NAME = 'CityTwinDB';
const STORE_NAME = 'city_cache';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'city_name' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export const localCache = {
    async get(cityName) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(cityName.toLowerCase().trim());

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async set(cityName, data) {
        const db = await openDB();
        const normalizedName = cityName.toLowerCase().trim();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Merge with existing data if any (e.g. if we have graph but not elevation yet)
            const getRequest = store.get(normalizedName);
            
            getRequest.onsuccess = () => {
                const existing = getRequest.result || { city_name: normalizedName };
                const updated = { ...existing, ...data };
                const putRequest = store.put(updated);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            
            getRequest.onerror = () => reject(getRequest.error);
        });
    },

    async clear() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
