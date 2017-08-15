const Propagator =require('./Propagator');
const Store = require('./Store');

class Pump {
    constructor(model) {
        this.propagator = new Propagator();
        this.store = new Store(model, data => this.propagator.publish(data));  
    }
}

module.exports = Pump;
