import { render } from 'preact';
import { App } from './app';
import './styles/global.css';

// Apply the design-system root class to <body>.
// All design tokens and layout utilities depend on this being present.
document.body.classList.add('sb');

render(<App />, document.getElementById('app')!);
