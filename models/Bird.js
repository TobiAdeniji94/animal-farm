const Animal = require('./Animal');

/**
 * Bird class
*/
class Bird extends Animal {
  constructor(name, canFly = false, canCrow = false) {
    super(name, 2);
    this.canFlyAbility = canFly;
    this.canCrowAbility = canCrow;
    
    // Set available actions based on abilities
    this.availableActions = [];
    if (canFly) this.availableActions.push('fly');
    if (canCrow) this.availableActions.push('crow');
  }

  fly() {
    if (!this.canFlyAbility) {
      throw new Error(`${this.name} cannot fly.`);
    }
    return `${this.name} is flying!`;
  }

  crow() {
    if (!this.canCrowAbility) {
      throw new Error(`${this.name} cannot crow.`);
    }
    return `${this.name} is crowing!`;
  }

  getStatus() {
    return {
      ...super.getStatus(),
      canFly: this.canFlyAbility,
      canCrow: this.canCrowAbility
    };
  }
}

module.exports = Bird;
