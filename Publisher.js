const logger = require('simple-console-logger');

const log = logger.getLogger('events');

/**
 *
 * Ridiculously minimal plublisher/event dispatcher class.
 *
 */
class Publisher {
    
    constructor() {
        Object.defineProperty(this, "_map", { value: {}, writable: false });
    }

   /**
    * Subscribe to selected events.
    */ 
    subscribe(callback, selector) {
        log.debug("Publisher.subscribe", callback, selector);
        let symbol = Symbol();
        this._map[symbol] = selector ? data => { let res = selector.select(data); if (res) callback(res); } : callback;
        log.debug("Publisher.subscribe - map is now " , this._map);
        return symbol;
    }

    unsubscribe(subscription) {
        log.debug("Publisher.unsubscribe");
        console.assert(typeof subscription == 'symbol', 'subscription must be a symbol');
        delete this._map[subscription];
    }

    publish(data) {
        log.debug("Publisher.publish", data);
        for (let symbol of Object.getOwnPropertySymbols(this._map)) {
            let callback = this._map[symbol];
            log.debug("Publisher.publish calling", callback);
            callback(data);
        }
    }
}

module.exports = Publisher;
