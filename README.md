# react-plumbing

React-plumbing is an Event propagation a State management framework for react, similar to flux etc.

The services provided by react-plumbing are provided by a container object that wraps your highest-level react object. The `Pump` object in the react-plumbing framework provides a 'store' object that ecapsulates all application state. All updates to this state should be mediated by the store's action dispatcher. The pump object also takes care of propagating change events to lower-level components via the popagator object. The application data model is exposed the `Pump` via an object (`Site` in the example below) that is provided in the Pump's constructor.  

```
import App from './App';
import { Pump, Action, Container } from 'react-plumbing'
import Site from './model/Site'

logger.configure(logconfig);

const pump = new Pump(new Site());

ReactDOM.render(
    <Container 
        store={pump.store} 
        propagator={pump.propagator}>
        <App />
    </Container>, 
    document.getElementById('root'));

```
React components are wrapped by a HOC so that the store and propagator objects provided to the container are always available:

```
import { Selector, Action, wrap } from 'react-plumbing'
import { Modal, Button, Panel, Accordion } from 'react-bootstrap'

const site = Action.builder;

function MessagePopup(props, context) {

    function formatMessage(message) { return ( 
        <Panel key={message.id} header={message.text}>{message.detail}</Panel>
    );}

    return (
        <Modal.Dialog>
            <Modal.Header><Modal.Title>Alert</Modal.Title></Modal.Header>
            <Modal.Body> 
                <Accordion>{ props.messages.map(formatMessage) }</Accordion>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={context.submitter(site.clearMessages())}>OK</Button>
            </Modal.Footer>
        </Modal.Dialog>
    );
}

export default wrap(MessagePopup,  Selector.map( site => { return { messages: site.messages } } ));
```
