'use strict';

//const { default: cluster } = require('cluster');
const { ZigBeeDevice } = require('homey-zigbeedriver');
const { start } = require('repl');
const { Cluster} = require('zigbee-clusters');
const TuyaWindowCoveringCluster = require('../../lib/TuyaWindowCoveringCluster')
Cluster.addCluster(TuyaWindowCoveringCluster);

class MyDevice extends ZigBeeDevice {

  /**
   * onInit is called when the device is initialized.
   */
 
  async onNodeInit({ zclNode }) {
    this.log('MyDevice has been initialized');
  	
		this.registerCapabilityListener('windowcoverings_state', async (value) => {
      //this.log(value);
      switch (value) {
        case "up" : await this.zclNode.endpoints[1].clusters.windowCovering.upOpen(); //this.log("open");
        break;
        case "down" : await this.zclNode.endpoints[1].clusters.windowCovering.downClose(); //this.log("close");
        break
        case "idle" : await this.zclNode.endpoints[1].clusters.windowCovering.stop(); //this.log("stop");
        break
      }
    });

    
    if (!this.hasCapability('button.start_calibration')) 
      await this.addCapability('button.start_calibration');
    
    if (!this.hasCapability('button.stop_calibration')) 
      await this.addCapability('button.stop_calibration');
    
    if (this.hasCapability('button.start_calibration')) {
        this.registerCapabilityListener('button.start_calibration', async () => {
            await this.zclNode.endpoints[1].clusters.windowCovering.writeAttributes({calibration: 'Start'});
            //this.log("Calibration start"); 
            return;
        });
        this.registerCapabilityListener('button.stop_calibration', async () => {
            await this.zclNode.endpoints[1].clusters.windowCovering.writeAttributes({calibration: 'End'});
            //this.log("Calibration stopped"); 
            return;
        });
    }
   

  }


  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');

    if (changedKeys.includes('reverse')) {
        await this.zclNode.endpoints[1].clusters.windowCovering.writeAttributes({motorReversal: 'On'});      
        const motorReversed = newSettings['reverse'];
        //this.log(motorReversed);
        if (motorReversed === 0) {
            await this.zclNode.endpoints[1].clusters.windowCovering.writeAttributes({motorReversal: 'Off'});
            //this.log("Calibration stopped, status: ", await this.zclNode.endpoints[1].clusters.windowCovering.readAttributes(motorReversal));
        } else {
            await this.zclNode.endpoints[1].clusters.windowCovering.writeAttributes({motorReversal: 'On'});
            //this.log("Calibration stopped, status: ", await this.zclNode.endpoints[1].clusters.windowCovering.readAttributes(motorReversal));
        }

    }
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
