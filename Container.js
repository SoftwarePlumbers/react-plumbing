const React = require('react');

const PropTypes = require('prop-types');


class Container extends React.Component {

    getChildContext() {
        let context = { store: this.props.store, propagator: this.props.propagator, submitter: (action) => () => this.props.store.submit(action) };
        // console.log(`Container.getChildContext returning: ${JSON.stringify(context)}`);
        return context;
    }

    render() {
        return React.Children.only(this.props.children);
    }
}

Container.childContextTypes = {
    store: PropTypes.object.isRequired,
    propagator: PropTypes.object.isRequired,
    submitter: PropTypes.func.isRequired
};

module.exports = Container;
