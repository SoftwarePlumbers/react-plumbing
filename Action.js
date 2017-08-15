const COMMANDS = require('./Commands');
const Builder = require('codelike');
const logger = require('simple-console-logger');

const log = logger.getLogger('actions');


/** Capitalize  a string */
function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

class ScriptBuilder {

    constructor(script = []) { this.script = script; }
    result()    { return this.script; }
    push(item) { this.script.push(item); return this; }
    visitRoot() { };
    visitThen() { };
    visitwhen() { };
    visitGet() { };
    visitCall() { };
}

class createUpdateScript extends ScriptBuilder {

    visitGet(first,name) {
        this.push(1)
            .push('set' + capitalize(name))
            .push(COMMANDS.CALL);
        
        first.visit(this);
    }
    visitCall(first,name,parameters) { 
        if (name === '$find') {
            this.push(parameters[0])
                .push(COMMANDS.UPDATE);
            first.visit(this);
        }
    }
}

class createGetForUpdateScript  extends ScriptBuilder {

    visitGet(first,name) {
        first.visit(this);
        this.push(COMMANDS.DUP)
            .push(name)
            .push(COMMANDS.GET);
    }
    visitCall(first,name,parameters) {
        if (name === '$find') {
            first.visit(this);
            this.push(COMMANDS.DUP) 
                .push(parameters[0])
                .push(COMMANDS.FIND);
        }
     }
}

class createGetScript  extends ScriptBuilder {

    visitRoot() { this.push(COMMANDS.DUP)};  
    visitGet(first, name) {
        first.visit(this);
        this.push(name)
            .push(COMMANDS.GET);
    }
    visitCall(first,name,parameters) { 
        if (name === '$find') {
            first.visit(this);
            this.push(parameters[0])
                .push(COMMANDS.FIND);
        }
    }
}


class createScript  extends ScriptBuilder {
        
    visitThen(first, then) { first.visit(this); then.visit(this); }
    visitWhen(action, condition) {
        condition.visit(new createGetScript(this.script));
        let action_visitor = new createScript();
        action.visit(action_visitor);
        this.push(action_visitor.result())
            .push(COMMANDS.WHEN);
    }
    visitCall(first,name,parameters) { 
        if (name !== '$find') {
            first.visit(new createGetForUpdateScript(this.script));
            for (let parameter of parameters) this.push(parameter);
            this.push(parameters.length)
                .push(name)
                .push(COMMANDS.CALL);
            first.visit(new createUpdateScript(this.script));
        }
    }
}

module.exports = new Builder('Action', [ createScript ]);


