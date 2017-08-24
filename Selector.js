const debug = require('debug')('react-plumbing~selector');

const NO_MAP = val => val;
const NO_FILTER = val => true;

class Selector {


    static _equals(a, b, compare) {
        debug("Selector._equals", a, b);
        if (a === b) return true;
        //console.log('not identical');
        let aType = typeof a;
        let bType = typeof b;
        if (aType !== bType) return false;
        //console.log('types are same');
        if (aType === 'object') {
            //console.log('using object comparison')
            let aKeys = Object.keys(a);
            let bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            //console.log('key array lengths are the same');
            let res = true;
            for (let i = 0; i < aKeys.length && res; i++) 
                res = compare(a[aKeys[i]],b[bKeys[i]]);
            return res;
        } else if (aType === 'array') {
            //console.log('using array comparison')
            if (a.length !== b.length) return false;
            let res = true;
            for (let i = 0; i < a.length; i++)
                res = compare(a[i], b[i]);
            return res;
        }
        return false;
    }

    static _logComparison(a,b) {
        debug(`${a} === ${b} is ${a === b}`); return a === b;
    }

    static shallowEquals(a, b) { return Selector._equals(a,b, (a,b) => a === b); }
    static deepEquals(a,b) { return Selector._equals(a,b, Selector._equals); }

    constructor(map = NO_MAP, filter = NO_FILTER) {
        this._map = map;
        this._filter = filter;
    }

    select(state) {
        try {
            let result = this._map(state);
            if (this._filter(result)) return result;
        } catch (err) {
            // Don't rethrow, as this can happen when an object is re-assigned
            log.warn("Selector - dropping event due to ", err);
        }
        debug("Selector - dropping event");
        return null;
    }

    filter(filter) {
        return new Selector(this._map, a => this._filter(a) && filter(a));
    }

    map(map) {
        return new Selector(a => map(this._map(a)), this._filter);
    }

    filterUnchanged(init, comparator = Selector.shallowEquals) {
        const state = { data: init };
        return this.filter(data => { let res = !comparator(state.data, data); state.data = data; return res; });
    }

    static map(map) {
        return new Selector(map, NO_FILTER);
    }

    static filter(filter) {
        return new Selector(NO_MAP, filter);
    }
}


module.exports = Selector;
