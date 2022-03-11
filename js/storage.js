//Function to save data in IndexedDB
function saveData(value) {
    // Number of cities names that should be stored. 
    let size = 10;
    if(window.indexedDB) {
        let request = window.indexedDB.open("WeatherAppDatabase");
        //For creating store for first time.
        request.onupgradeneeded = e => {
            const db = e.target.result;
            db.createObjectStore("CitiesStore", { autoIncrement: true});
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
            console.log(e.target.error.message);
        }
    } else {
        alert("You browser does not support indexedDB API");
    }
}

//Function to get cities names from IndexedDB.
const loadData = () => {
    if(window.indexedDB) {
        return new Promise(
            function(resolve, reject) {
                let request = window.indexedDB.open("WeatherAppDatabase");
                request.onupgradeneeded = e => {
                    const db = e.target.result;
                    db.createObjectStore("CitiesStore", { autoIncrement: true});
                };
                request.onsuccess = event => {
                    const db = event.target.result;
                    if(db.objectStoreNames.contains('CitiesStore')){
                        db.transaction("CitiesStore").objectStore("CitiesStore").get(1).onsuccess = e => {
                        if(e.target.result)
                            resolve(e.target.result);
                        else
                            resolve([])
                        }
                    }
                }
            });
    } else {
        alert("You browser does not support indexedDB API");
    }
}