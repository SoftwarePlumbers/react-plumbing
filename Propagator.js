/** Event propagator
 */

const Publisher = require('./Publisher');


class Propagator extends Publisher {

    constructor() {
        super();
        // Should probably be using a weak map here and creating own ids for debug purposes.
        this.children = {};
        this.id = Symbol();
        // console.log(`constructed Propagator ${this} with map ${this._map}`);
    }

    publish(data) {
        // console.log(`publishing ${data} via Propagator ${this} with map ${this._map}`)
        super.publish(data);
        for (let id of Object.getOwnPropertySymbols(this.children)) this.children[id].publish(data);
    }

    addChild(child) {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children[child.id] = child;
    }

    removeChild(child) {
        if (child.parent !== this) throw 'cannot remove child from propagator which is not its parent';
        delete this.children[child.id];
        child.parent = null;
    }
}

module.exports = Propagator;
