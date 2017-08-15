const Selector = require('./Selector');
const chai = require('chai');

const expect = chai.expect;

const elem1 = {
    d: 3,
    e: 4
};

const elem2 = {
    d: 5,
    e: 6
};

const testState1 = {
    a: 1,
    b: 2,
    c: elem1
};

const testState2 = {
    a: 1,
    b: 0,
    c: elem1
};

const testState3 = {
    a: 1,
    b: 2,
    c: elem2
};

const map1 = state => { return { first: state.a, second: state.c.d }; };

describe('Selector', () => {

it('Selector copies data from state', () => {
    let selector = Selector.map(map1);
    let result = selector.select(testState1);
    expect(result).to.deep.equal({ first: 1, second: 3 });
});

it('Selector identifies when selected data has changed', () => {
    let selector = Selector.map(map1).filterUnchanged(map1(testState1));
    expect(selector.select(testState1)).to.be.null;
    expect(selector.select(testState2)).to.be.null;
    expect(selector.select(testState3)).to.deep.equal({first: 1, second: 5});
});

it('Selector filters data', () => {
    let selector = Selector.filter( state => state.c.d == 3 );
    expect(selector.select(testState1)).to.deep.equal(testState1);
    expect(selector.select(testState2)).to.deep.equal(testState2);
    expect(selector.select(testState3)).to.be.null;
});

});


