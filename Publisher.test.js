const Selector = require('./Selector');
const Publisher = require('./Publisher');
const chai = require('chai');

const expect = chai.expect;

describe('Publisher', () => {

it('Publish sends message to all subscribers', () => {
    let publisher = new Publisher()
    let r1 = {}
    let r2 = {};
    let s1 = publisher.subscribe(data => r1.data = data);
    let s2 = publisher.subscribe(data => r2.data = data);

    publisher.publish("hello");
    
    expect(r1.data).to.exist;
    expect(r2.data).to.exist;
    expect(r1.data).to.equal("hello");
    expect(r2.data).to.equal("hello");
});

it('Unsubscribe stops message reception', () => {
    let publisher = new Publisher()
    let r1 = {}
    let r2 = {};
    let s1 = publisher.subscribe(data => r1.data = data);
    let s2 = publisher.subscribe(data => r2.data = data);

    publisher.publish("hello");
    
    publisher.unsubscribe(s1);

    publisher.publish("goodbye");

    expect(r1.data).to.equal("hello");
    expect(r2.data).to.equal("goodbye");
});

it('Selectors allow subscriptions to be filtered', () => {
    let publisher = new Publisher()
    let r1 = {}
    let r2 = {};
    let s1 = publisher.subscribe(data => r1.data = data, Selector.filter(data => data.includes("Jonathan")));
    let s2 = publisher.subscribe(data => r2.data = data);

    publisher.publish("hello");

    expect(r1.data).to.not.exist;
    expect(r2.data).to.equal("hello");
    
    publisher.publish("goodbye, Jonathan");

    expect(r1.data).to.equal("goodbye, Jonathan");
    expect(r2.data).to.equal("goodbye, Jonathan");
});   

});
