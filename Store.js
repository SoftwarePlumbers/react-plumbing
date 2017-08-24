const debug = require('debug')('react-plumbing~store');
const Action = require('./Action');
const COMMANDS = require('./Commands');


function isQuoted(val) {
    if (val && typeof val === 'string') {
                let fchar = val.charAt(0);
        return (fchar === '\'' || fchar === '"') && val.charAt(val.length - 1) === fchar;
    } else {
        return false;
    }
}

function stripQuote(val) {
    return (isQuoted(val)) ? val.slice(1,-1) : val;
}

class StoreException extends Error {}

class Store {

    constructor(state, notify_change, notify_error) {
        this.state = [ state ];
        this.pending_actions = [];
        this.notify_change = notify_change ? notify_change : (state) => {};
        this.notify_error = notify_error ? notify_error : (err) => { console.log(err) };
        this.pending = false;
    }

    _throw(message) {
        throw new StoreException(message);
    }

    _pop() {
        return this.state.pop();
    }

    _popN(n) {
        if (n === 0) return [];
        if (n === 1) return [ this.state.pop() ];
        if (n > this.state.length) this._throw("Stack underflow");
        let result = this.state.slice(-n);
        this.state = this.state.slice(0,  -n);
        return result;
    }

    _top() {
        return this.state[this.state.length-1];
    }

    _push(item) {
        return this.state.push(item);
    }
   
    _callMethod(method) {
        let parameter_count = this._pop();
        let parameters = this._popN(parameter_count);
        let object = this._pop();
        debug("State._executeStateMethod calling ", method, object, parameters);
        
        let func = object[method];
      
        if (func && typeof func === 'function') {
            let result = func.apply(object, parameters);
            if (result instanceof Promise) {
                this.pending = true;
                result.then(future => this._resume(future)).catch(err => this.notify_error(err));
            } else {
                debug("State._callMethod got result ", result);
                this._push(result);
            }
        } else {
            this._throw(`Invalid method ${method} in ${object.constructor.name}`);
        }      
    }

    _dup(top) {
        debug("Store._dup", top);
        this._push(top);
        this._push(top);
     }

    _getAttr(attribute) {
        let object = this._pop();
        debug("Store._getAttr", attribute, object);
        let val = object[attribute];
        if (val === undefined) {
            debug("getting from",object);
            this._throw(`unknown property ${attribute}`);
        }
        if (val instanceof Promise) {
            this.pending = true;
            val.then(future => this._resume(future)).catch(err => this.notify_error(err));
        } else {
            debug("State_getAttr got result ", val);
            this._push(val);
        }
    }

    _storeParameter(parameter) {
        debug("Store.storeParameter",  parameter); 
        this._push(parameter);
    }

    _doCommand(instruction) {
        if (instruction === COMMANDS.DUP) { 
            this._dup(this._pop());
            return true;
        }
        if (instruction === COMMANDS.SWAP) {
            this._swap(this._pop());
            return true;
        }
        if (instruction === COMMANDS.GET) {
            this._getAttr(this._pop());
            return true;
        }
        if (instruction === COMMANDS.UPDATE) {
            this._update(this._pop());
            return true;
        }
        if (instruction === COMMANDS.CALL) {
            this._callMethod(this._pop());
            return true;
        }
        if (instruction === COMMANDS.FIND) {
            this._find(this._pop());
            return true;
        }
        if (instruction === COMMANDS.WHEN) {
            this._when(this._pop());
            return true;
        }
        return false;
    }

    _doImmediate(instruction) { 
        if (!this._doCommand(instruction) ) this._storeParameter(instruction);        
    }   

     _resume(result) {
        this._push(result);
        let to_resume = this.pending_actions;
        this.pending_actions = [];
        this.pending = false;
        this.submitScript(to_resume);
    }

    _swap(top) {
        let val = this._pop();
        this._push(top);
        this._push(val);
    }

    _find(condition) {
        let val = this._pop();
        debug('Store._find', val, condition);
        this._push(val.find(condition));
    }

    _update(condition) {
        let val = this._pop();
        let collection = this._pop();        
        let ix = collection.findIndex(condition);
        collection[ix] = val;
        this._push(collection);
    }

    _when(script) {
        this.dumpStack();
        let condition = this._pop();
        debug("Store._when", condition, script);
        if (condition) 
            this._evaluate(script);
        else {
            this.dumpStack();
        }
    }

    _evaluate(script) {
         for (let action of script) {
            debug("action", action.name || action);
            if (this.pending)
                this.pending_actions.push(action);
            else
                this._doImmediate(action);
        }
    }
   

    submitScript(script) {
        console.assert(script instanceof Array, 'Script must be an array');
        debug("Store.submitScript", script);
        debug("Store.submitScript actions pending", this.pending);

        this._evaluate(script);

        if (!this.pending) {
            if (this.state.length > 1) {    
                log.warn('Stack is growing...');
                this.dumpStack();
            }
            if (this.state.length < 1) {
                log.error('Stack exhausted');
            }
            this.notify_change(this.getCurrentState());
        }
    }

    submit(action) {
        log.info(`Submitted ${Action.stringify(action)}`);
        this.submitScript(Action.createScript(action));
    }

    getCurrentState() {
        return this.state[0];
    }

    dumpStack() {
        for (let i = 0; i < this.state.length; i++) {
            let item = this.state[i];
            debug(i, item);
        }
    }
}



module.exports = Store;
