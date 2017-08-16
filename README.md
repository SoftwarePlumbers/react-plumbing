# react-plumbing

React-plumbing is an Event propagation a State management framework for react, similar to flux etc.

The services provided by react-plumbing are provided by a container object that wraps your highest-level react object. The `Pump` object in the react-plumbing framework provides a 'store' object that ecapsulates all application state. All updates to this state should be mediated by the store's action dispatcher. The pump object also takes care of propagating change events to lower-level components via the popagator object. The application data model is exposed the `Pump` via an object (`Site` in the example below) that is provided in the Pump's constructor.  

```javascript
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

```javascript
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

In the above example, the `Action` API is being used to prepare actions to send to the Store via the `context.submitter` function, and the`Selector` API is being used to filter information from the Site object and preset it to the JSX view. Action allows you to reference methods and properties of the site object in order to construct complex actions fairly freely:

```javascript
const site = Action.builder;

function loginAction(form) {
    return site.clearMessages()
        .then(action.authenticate(form.username,form.password))
        .then(action.closePopup().when(action.authenticated));
}
```

In the above example the loginAction function is creating an action that will call the `clearMessages` method on the actual `Site` object provided to `Pump`, then the `authenticate` method, and then the `closePopup` method - but only if the `authenticated` property of site is true. These methods can return ordinary objects or promises.

The important thing here is that creating an action binds any parameters (`form.username` and `password` above) but  does not invoke the methods. Method invocation happens only when the action is submitted via `context.submitter` or `context.store.submit`. 

On completion of the action (including resolving any promises), changes to the site object are broadcast to all components. The `Selector` object in the above example ensures this the dialog is aware of any changes to the `messages` property of site.

For this to work, Site (and any sub-objects) need to be immutable. That is, 'setter' methods need to be written to return a new copy of the object (or a promise thereof) rather than change the original. For example, the `clearMessages` method above would be written:

```javascript
clearMessages() {
    return Object.assign({}, this, { messages: [] });
}
```

Action takes care of some of the awkwardness of this when invoking methods on sub-objects of site. For example:

```javascript
const action = site.screen.cursor.next();
```

Will ultimately perform something like the following method chain when submitted to the store:

```javascript
let new_cursor = store.site.screen.cursor.next();
let new_screen = store.site.screen.setCursor(new_cursor);
store.site = store.site.setScreen(new_screen);
```

Although since the store also takes care of resolving any promises the actual code is somewhat more complicated.








