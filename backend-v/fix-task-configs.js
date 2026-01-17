// Script to fix automation rules with missing task configurations
const mongoose = require('mongoose');
const AutomationRule = require('./schema/AutomationRule');

// Connect to MongoDB
async function fixTaskConfigs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/FunnelsEye');
    console.log('Connected to MongoDB');

    // Find all automation rules
    const rules = await AutomationRule.find({}).select('name workflowType nodes actions');

    console.log(`Found ${rules.length} automation rules to check`);

    let fixedCount = 0;

    for (const rule of rules) {
      let needsUpdate = false;

      if (rule.workflowType === 'graph' && rule.nodes) {
        // Fix graph-based rules
        rule.nodes.forEach(node => {
          if (node.type === 'action' && node.nodeType === 'create_task') {
            if (!node.data || !node.data.config || !node.data.config.taskName) {
              console.log(`Fixing graph rule "${rule.name}" - task node missing config`);
              if (!node.data) node.data = {};
              if (!node.data.config) node.data.config = {};
              if (!node.data.config.taskName) {
                node.data.config.taskName = 'Task created by automation';
              }
              needsUpdate = true;
            }
          }
        });
      } else if (rule.actions) {
        // Fix legacy rules
        rule.actions.forEach(action => {
          if (action.type === 'create_task') {
            if (!action.config || (!action.config.name && !action.config.taskName)) {
              console.log(`Fixing legacy rule "${rule.name}" - task action missing name`);
              if (!action.config) action.config = {};
              if (!action.config.name && !action.config.taskName) {
                action.config.name = 'Task created by automation';
              }
              needsUpdate = true;
            }
          }
        });
      }

      if (needsUpdate) {
        await rule.save();
        fixedCount++;
        console.log(`Updated rule: ${rule.name}`);
      }
    }

    console.log(`Fixed ${fixedCount} automation rules with missing task configurations`);

  } catch (error) {
    console.error('Error fixing task configs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixTaskConfigs();