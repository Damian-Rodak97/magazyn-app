// BlazorDB minimal JS wrapper
window.BlazorDB = {
    _dbVersion: 2, // Increased version to ensure WarehouseStore creation
    _openConnections: [],
    
    _closeAllConnections: function() {
        console.log('Closing all DB connections');
        this._openConnections.forEach(db => {
            try {
                db.close();
            } catch (e) {
                console.error('Error closing connection', e);
            }
        });
        this._openConnections = [];
    },
    
    Put: function(store, obj) {
        console.log('BlazorDB.Put', store, obj);
        let dbReq = indexedDB.open('MagazynDB', window.BlazorDB._dbVersion);
        
        dbReq.onblocked = function(e) {
            console.warn('Put onblocked - closing all connections', store);
            window.BlazorDB._closeAllConnections();
        };
        
        dbReq.onupgradeneeded = function(e) {
            console.log('Put onupgradeneeded', store, 'from version', e.oldVersion, 'to', e.newVersion);
            let db = e.target.result;
            // Create both stores during upgrade
            if (!db.objectStoreNames.contains('GridStore')) {
                console.log('Creating GridStore');
                db.createObjectStore('GridStore', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('WarehouseStore')) {
                console.log('Creating WarehouseStore');
                db.createObjectStore('WarehouseStore', { keyPath: 'id' });
            }
        };
        
        dbReq.onsuccess = function(e) {
            console.log('Put onsuccess', store);
            let db = e.target.result;
            window.BlazorDB._openConnections.push(db);
            
            let tx = db.transaction(store, 'readwrite');
            let storeObj = tx.objectStore(store);
            let putReq = storeObj.put(obj);
            
            putReq.onsuccess = function() {
                console.log('Put completed', store, obj);
            };
            
            putReq.onerror = function(err) {
                console.error('Put error', store, err);
            };
            
            tx.oncomplete = function() {
                db.close();
                window.BlazorDB._openConnections = window.BlazorDB._openConnections.filter(c => c !== db);
            };
        };
        
        dbReq.onerror = function(e) {
            console.error('Put dbReq error', store, e, e.target.error);
        };
    },
    Get: function(store, id) {
        console.log('BlazorDB.Get', store, id);
        return new Promise(function(resolve, reject) {
            let dbReq = indexedDB.open('MagazynDB', window.BlazorDB._dbVersion);
            
            dbReq.onblocked = function(e) {
                console.warn('Get onblocked - closing all connections', store);
                window.BlazorDB._closeAllConnections();
            };
            
            dbReq.onupgradeneeded = function(e) {
                console.log('Get onupgradeneeded', store, 'from version', e.oldVersion, 'to', e.newVersion);
                let db = e.target.result;
                // Create both stores during upgrade
                if (!db.objectStoreNames.contains('GridStore')) {
                    console.log('Creating GridStore');
                    db.createObjectStore('GridStore', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('WarehouseStore')) {
                    console.log('Creating WarehouseStore');
                    db.createObjectStore('WarehouseStore', { keyPath: 'id' });
                }
            };
            
            dbReq.onsuccess = function(e) {
                console.log('Get onsuccess', store);
                let db = e.target.result;
                window.BlazorDB._openConnections.push(db);
                
                let tx = db.transaction(store, 'readonly');
                let storeObj = tx.objectStore(store);
                let req = storeObj.get(id);
                
                req.onsuccess = function() {
                    console.log('Get completed', store, req.result);
                    resolve(req.result);
                };
                
                req.onerror = function() {
                    console.log('Get error', store);
                    resolve(null);
                };
                
                tx.oncomplete = function() {
                    db.close();
                    window.BlazorDB._openConnections = window.BlazorDB._openConnections.filter(c => c !== db);
                };
            };
            
            dbReq.onerror = function(e) {
                console.error('Get dbReq error', store, e, e.target.error);
                resolve(null);
            };
        });
    },
    Delete: function(store, id) {
        console.log('BlazorDB.Delete', store, id);
        let dbReq = indexedDB.open('MagazynDB', window.BlazorDB._dbVersion);
        
        dbReq.onblocked = function(e) {
            console.warn('Delete onblocked - closing all connections', store);
            window.BlazorDB._closeAllConnections();
        };
        
        dbReq.onupgradeneeded = function(e) {
            console.log('Delete onupgradeneeded', store, 'from version', e.oldVersion, 'to', e.newVersion);
            let db = e.target.result;
            // Create both stores during upgrade
            if (!db.objectStoreNames.contains('GridStore')) {
                console.log('Creating GridStore');
                db.createObjectStore('GridStore', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('WarehouseStore')) {
                console.log('Creating WarehouseStore');
                db.createObjectStore('WarehouseStore', { keyPath: 'id' });
            }
        };
        
        dbReq.onsuccess = function(e) {
            console.log('Delete onsuccess', store);
            let db = e.target.result;
            window.BlazorDB._openConnections.push(db);
            
            let tx = db.transaction(store, 'readwrite');
            let storeObj = tx.objectStore(store);
            storeObj.delete(id);
            console.log('Delete completed', store, id);
            
            tx.oncomplete = function() {
                db.close();
                window.BlazorDB._openConnections = window.BlazorDB._openConnections.filter(c => c !== db);
            };
        };
        
        dbReq.onerror = function(e) {
            console.error('Delete dbReq error', store, e, e.target.error);
        };
    }
};

// Funkcja do pobierania plików PDF
window.downloadFile = function(fileName, contentOrBase64String) {
    try {
        let blob;
        
        // Check if it's JSON (starts with { or [) or base64 PDF
        if (typeof contentOrBase64String === 'string' && 
            (contentOrBase64String.trim().startsWith('{') || contentOrBase64String.trim().startsWith('['))) {
            // JSON content - download as text file
            blob = new Blob([contentOrBase64String], { type: 'application/json' });
        } else {
            // Base64 PDF content
            const byteCharacters = atob(contentOrBase64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: 'application/pdf' });
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('File downloaded:', fileName);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Błąd podczas pobierania pliku: ' + error.message);
    }
};

// Setup file import functionality
let dotNetReference = null;

window.setupFileImport = function(dotNetHelper) {
    dotNetReference = dotNetHelper;
    
    // Create hidden file input if it doesn't exist
    if (!document.getElementById('backupFileInput')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'backupFileInput';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    await dotNetReference.invokeMethodAsync('HandleFileContent', text);
                } catch (error) {
                    console.error('Error reading file:', error);
                    alert('Błąd podczas odczytu pliku: ' + error.message);
                }
            }
            // Reset value so the same file can be selected again
            fileInput.value = '';
        });
    }
};

window.triggerFileInput = function() {
    const fileInput = document.getElementById('backupFileInput');
    if (fileInput) {
        fileInput.click();
    }
};

// Funkcja do hashowania hasła (SHA-256)
window.hashPassword = async function(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};
