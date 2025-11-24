/**
 * Base Animal class
 * All farm animals inherit from this class
 */
class Animal {
  constructor(name, legs) {
    if (this.constructor === Animal) {
      throw new Error("Cannot instantiate abstract class Animal directly");
    }
    
    this.name = name;
    this.legs = legs;
    this.isHungry = false;
    this.isSleepy = false;
    this.currentDuty = null;
    this.currentAction = null;
  }

  // Universal behaviors
  eat() {
    if (!this.isHungry) {
      return `${this.name} is not hungry right now.`;
    }
    this.isHungry = false;
    return `${this.name} is eating.`;
  }

  sleep() {
    if (!this.isSleepy) {
      return `${this.name} is not sleepy right now.`;
    }
    this.isSleepy = false;
    return `${this.name} is sleeping.`;
  }

  setHungry(hungry) {
    this.isHungry = hungry;
    return `${this.name} is now ${hungry ? 'hungry' : 'not hungry'}.`;
  }

  setSleepy(sleepy) {
    this.isSleepy = sleepy;
    return `${this.name} is now ${sleepy ? 'sleepy' : 'not sleepy'}.`;
  }

  // Duty management
  setDuty(duty) {
    this.currentDuty = duty;
    return `${this.name}'s duty is now: ${duty}`;
  }

  performDuty() {
    if (!this.currentDuty) {
      throw new Error(`${this.name} has no duty assigned.`);
    }

    if (this.isHungry || this.isSleepy) {
      throw new Error(
        `${this.name} cannot perform duty because they are ${
          this.isHungry ? 'hungry' : 'sleepy'
        }.`
      );
    }

    return `${this.name} is performing duty: ${this.currentDuty}`;
  }

  // Action management
  setAction(action) {
    if (!this.availableActions || !this.availableActions.includes(action)) {
      throw new Error(`${action} is not a valid action for ${this.constructor.name}`);
    }
    this.currentAction = action;
    return `${this.name}'s action is now: ${action}`;
  }

  performAction() {
    if (!this.currentAction) {
      throw new Error(`${this.name} has no action assigned.`);
    }

    if (this.isHungry || this.isSleepy) {
      throw new Error(
        `${this.name} cannot perform action because they are ${
          this.isHungry ? 'hungry' : 'sleepy'
        }.`
      );
    }

    // Call the specific action method
    const actionMethod = this.currentAction.toLowerCase();
    if (typeof this[actionMethod] === 'function') {
      return this[actionMethod]();
    }

    return `${this.name} is performing action: ${this.currentAction}`;
  }

  // Get animal status
  getStatus() {
    return {
      name: this.name,
      type: this.constructor.name,
      legs: this.legs,
      isHungry: this.isHungry,
      isSleepy: this.isSleepy,
      currentDuty: this.currentDuty,
      currentAction: this.currentAction,
      availableActions: this.availableActions || []
    };
  }
}

module.exports = Animal;
