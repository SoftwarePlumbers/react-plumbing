const PropTypes = require('prop-types');
const Propagator = require('./Propagator');
const React = require('react');
const debug = require('debug')('react-plumbing~wrapper');


class Wrapper extends React.Component {

    static figureOutName(wrapped) {
        if (typeof wrapped === 'function')
            return wrapped.name;
        if (typeof wrapped === 'object')
            return wrapped.constructor.name;
        return 'Wrapped Component';
    }

    constructor(wrapped, selector, props, context) {
        super(props,context);
        if (!context) console.warn('Wrapper received no context');
        this.selector = selector.filterUnchanged();
        this.wrapped = wrapped;
        debug('Wrapper.constructor store', context.store);
        this.state = selector.select(context.store.getCurrentState());
        debug('Wrapper.constructor state', this.state);
        this.propagator = new Propagator();
        this.wrappedname = Wrapper.figureOutName(wrapped);
    }

    getChildContext() { 
        return { propagator: this.propagator };
    }
    
    componentDidMount() { 
        if (this.context.propagator) 
            this.context.propagator.addChild(this.propagator);
        else
            console.warn(`no propagator in context: ${JSON.stringify(this.context)}`);
        if (!this.subscription) this.subscription = this.propagator.subscribe(props => this.notifyChange(props), this.selector);
    }

    componentWillUnmount() {
        if (this.subscription) { this.propagator.unsubscribe(this.subscription); this.subscription = null; }
        this.context.propagator.removeChild(this.propagator);
    }

    notifyChange(props) {
        debug('Wrapper.notifyChange received props ', this.wrappedname, props);
        this.setState(props);
    }

    render() {
        let merged_props = Object.assign({}, this.props, this.state ); 
        debug('Wrapper.render', this.wrappedname, merged_props);
        return React.createElement(this.wrapped, merged_props);
    }
}

const CHILD_CONTEXT_TYPES = { 
    propagator: PropTypes.object.isRequired 
};

const CONTEXT_TYPES = { 
    store: PropTypes.object.isRequired,
    propagator: PropTypes.object.isRequired,
    submitter: PropTypes.func.isRequired
};


module.exports = function (wrapped, selector) {

    class WrapperInstance extends Wrapper { 
        constructor(props, context) { 
            super(wrapped,selector,props,context);
        } 
    }

    WrapperInstance.childContextTypes = CHILD_CONTEXT_TYPES; 
    WrapperInstance.contextTypes = CONTEXT_TYPES;
    wrapped.contextTypes = CONTEXT_TYPES;

    return WrapperInstance;
};


