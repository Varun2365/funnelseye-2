// services/eventEmitterService.js
const EventEmitter = require('events');
const funnelsEyeEventEmitter = new EventEmitter();
// Export a single, shared instance of the EventEmitter
module.exports = funnelsEyeEventEmitter;