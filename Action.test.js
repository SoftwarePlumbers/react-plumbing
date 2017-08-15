const COMMANDS = require('./Commands');
const chai = require('chai');
const Actions = require('./Action');
const Action = Actions.builder;
const logger = require('simple-console-logger');

const log = logger.getLogger('tests');

const expect = chai.expect;

describe('Action', () => {

it('Can create action chain and convert to string', () => {
    let action = Action.abc.def.ghi(123,456);
    expect(action).to.exist;
    expect(Action.stringify(action)).to.equal("Action.abc.def.ghi(123,456)");
});

it('Can create filters', () => {
    const filter = () => false;
    let action = Action.abc.$find(filter);
    expect(action).to.exist;
    expect(Actions.stringify(action)).to.equal("Action.abc.$find(() => false)");
});

it('Convert action chain to script', () => {
    const filter = () => false;
    let array = Actions.createScript(Action.abc.def.ghi(1));
    expect(array).to.exist;
    expect(array).to.deep.equal([COMMANDS.DUP, "abc", COMMANDS.GET, COMMANDS.DUP, "def",COMMANDS.GET,1,1,"ghi",COMMANDS.CALL, 1,"setDef", COMMANDS.CALL, 1, "setAbc", COMMANDS.CALL]);
});

it('Convert then to script and string', () => {
    let action = Action.abc().then(Action.def());
    let script = Actions.createScript(action);
    expect(script).to.exist;
    expect(Actions.stringify(action)).to.equal("Action.abc().then(Action.def())");
    expect(script).to.deep.equal([0,"abc",COMMANDS.CALL,0,"def",COMMANDS.CALL]);
});

it('Convert when to script and string', () => {
    let action = Action.abc().when(Action.def);
    let script = Action.createScript(action);
    expect(script).to.exist;
    expect(Actions.stringify(action)).to.equal("Action.abc().when(Action.def)");
    expect(script).to.deep.equal([COMMANDS.DUP,"def",COMMANDS.GET,[0,"abc",COMMANDS.CALL],COMMANDS.WHEN]);
});

it('Can convert complex action to stript and string', () => {
    let a = 1;
    let b = 2;
    let action = Action.clearMessages();
    action = action.then(Action.authenticate(a,b));
    action = action.then(Action.closePopup().when(Action.authenticated));
    expect(Actions.stringify(action)).to.equal("Action.clearMessages().then(Action.authenticate(1,2)).then(Action.closePopup().when(Action.authenticated))");
});

});

