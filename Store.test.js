const Store = require('./Store');
const COMMANDS = require('./Commands');
const chai = require('chai');
const logger = require('simple-console-logger');

const log = logger.getLogger('tests');
const expect = chai.expect;


//logger.configure({ level: 'debug' });

class Test {
    constructor(val) { this.val = val; }
    inc()   { return new Test(this.val+1); }
    add(n)  { 
        log.debug("Test.add", this.val, n); 
        return new Test(this.val + n); 
    }
    get greaterThan10() { 
        log.debug("Test.greaterThan10", this.val);
        return this.val > 10; 
    }
    laterDec() { 
        return new Promise( 
            ( resolve, reject ) =>  { setTimeout( () => resolve(new Test(this.val-1)), 100 ); }
        ); 
    }
}

describe('Store', () => {

it('Can do basic push and pop', () => {
    let store = new Store(22, null, null);
    store._push(10);
    expect(store._pop(1)).to.equal(10);
    expect(store._pop(1)).to.equal(22);
});


it('Can notify on completion', done => {
    let store = new Store(new Test(22), 
        state => { 
            expect(state.val).to.equal(23);
            done();
        }, 
        err => {
            throw(err);
            done();
        }
    );

    store.submitScript( [ 0, "inc", COMMANDS.CALL ] );
});

it('Can chain actions', done => {
    let store = new Store(new Test(22), 
        state => { 
            expect(state.val).to.equal(25);
            done();
        }, 
        err => {
            throw(err);
            done();
        }
    );

    store.submitScript( [ 0, "inc", COMMANDS.CALL, 0, "inc", COMMANDS.CALL, 0, "inc", COMMANDS.CALL] );
});

it('Can handle parameters', done => {
    let store = new Store(new Test(22), 
        state => { 
            expect(state.val).to.equal(32);
            done();
        }, 
        err => {
            throw(err);
            done();
        }
    );

    store.submitScript( [ 10, 1, "add", COMMANDS.CALL] );
});


it('Can handle returned promises', done => {
    let store = new Store(new Test(22), 
        state => { 
            expect(state.val).to.equal(30);
            done();
        }, 
        err => {
            done(err);
        }
    );

    store.submitScript( [ 0, "laterDec", COMMANDS.CALL, 10, 1, "add", COMMANDS.CALL, 0, "laterDec", COMMANDS.CALL] );
});

it('Can handle conditional execution true', done => {
    let store = new Store(new Test(5), 
        state => { 
            expect(state.val).to.equal(16);
            expect(store.state.length).to.equal(1);
            done();
        }, 
        err => {
            done(err);
        }
    );

    store.submitScript( [ 10, 1, "add", COMMANDS.CALL, COMMANDS.DUP, "greaterThan10", COMMANDS.GET, [ 0, "inc", COMMANDS.CALL ], COMMANDS.WHEN] );   
});

it('Can handle conditional execution false', done => {
    let store = new Store(new Test(-5), 
        state => { 
            expect(state.val).to.equal(5);
            expect(store.state.length).to.equal(1);
            done();
        }, 
        err => {
            done(err);
        }
    );
    store.submitScript( [ 10, 1, "add", COMMANDS.CALL, COMMANDS.DUP, "greaterThan10", COMMANDS.GET, [ 0, "inc", COMMANDS.CALL ], COMMANDS.WHEN] );   
});


it('Can handle conditional execution true after promise', done => {

  let store = new Store(new Test(12), 
        state => { 
            expect(state.val).to.equal(12);
            expect(store.state.length).to.equal(1);
            done();
        }, 
        err => {
            done(err);
        }
    );

    store.submitScript( [ 0, "laterDec", COMMANDS.CALL, COMMANDS.DUP, "greaterThan10", COMMANDS.GET,[ 0, "inc", COMMANDS.CALL ], COMMANDS.WHEN] );  
});

it('Can handle conditional execution false after promise', done => {

    let store = new Store(new Test(5), 
        state => { 
            expect(state.val).to.equal(4);
            expect(store.state.length).to.equal(1);
            done();
        }, 
        err => {
            done(err);
        }
    );
    store.submitScript( [ 0, "laterDec", COMMANDS.CALL, COMMANDS.DUP, "greaterThan10", COMMANDS.GET,[ 0, "inc", COMMANDS.CALL ], COMMANDS.WHEN] );  
});

});




