// Storing previous cities name in IndexedDB as array.
let request = window.indexedDB.open("WeatherAppDatabase");

// Number of cities names that should be stored. 
let size = 10;

//Function to save data in IndexedDB
function saveData(value) {
    if(window.indexedDB) {
        //For creating store for first time.
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("CitiesStore")) {
                db.createObjectStore("CitiesStore", { autoIncrement: true});
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction(['CitiesStore'], 'readwrite');
            const store = tx.objectStore('CitiesStore');
            store.get(1).onsuccess = (e) => {
                if(e.target.result){
                    let index = e.target.result.indexOf(value);
                    let array= [value, ...e.target.result];
                    // Remove duplicates from array and maintain order of search. 
                    if( index != -1 ) {
                        array.splice(index+1,1);
                    }
                    store.put(array.splice(0,size), 1);
                }else{
                    store.put([value], 1);
                }
            }
        }

        request.onerror = (e)=>{
            console.log(e)
        }
    } else {
        alert("You browser does not support indexedDB API");
    }
}

//Function to get cities names from IndexedDB.
const loadData = (callback) => {
    if(window.indexedDB) {
        request.onsuccess = event => {
            const db = event.target.result;
            db.transaction("CitiesStore").objectStore("CitiesStore").get(1).onsuccess = e => {
                callback(e.target.result);
            };
        }
    } else {
        alert("You browser does not support indexedDB API");
    }
}